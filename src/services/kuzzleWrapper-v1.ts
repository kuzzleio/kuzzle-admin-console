import { Kuzzle, WebSocket } from 'kuzzle-sdk-v6';
import omit from 'lodash/omit';

import type { MappingAttributes } from './mappingHelpers';

// NOTE - We instantiate a new Kuzzle SDK with Websocket protocol
// pointing to `localhost` because we cannot instantiate the `WebSocket`
// class with `null` argument. The SDK will not initiate a connection to
// `localhost` as the call to `connect()` is performed in the `connectToEnvironment`
// method, which instantiates a new `WebSocket` class with the hostname
// corresponding to the selected environment.
export const kuzzle = new Kuzzle(new WebSocket('localhost'));

function buildCaseInsensitiveRegexp(searchString) {
  return searchString
    .split('')
    .map((letter) => {
      if ('.-'.includes(letter)) {
        return `\\${letter}`;
      }
      if ('#@'.includes(letter)) {
        return letter;
      }
      return `[${letter.toLowerCase()}${letter.toUpperCase()}]`;
    })
    .join('');
}

export class KuzzleWrapperV1 {
  version = '1';
  kuzzle: any = null;

  constructor(sdk) {
    this.kuzzle = sdk;
  }

  formatMeta(_kuzzle_info) {
    return {
      author: _kuzzle_info.author === '-1' ? 'Anonymous (-1)' : _kuzzle_info.author,
      updater: _kuzzle_info.updater === '-1' ? 'Anonymous (-1)' : _kuzzle_info.updater,
      createdAt: _kuzzle_info.createdAt,
      updatedAt: _kuzzle_info.updatedAt,
    };
  }

  disconnect() {
    this.kuzzle.disconnect();
    this.kuzzle.jwt = null;
  }

  async connectToEnvironment(environment) {
    // fix default port for users that have an old environment settings in their localStorage:
    if (environment.port === undefined) environment.port = 7512;
    if (typeof environment.ssl !== 'boolean') environment.ssl = false;

    if (this.kuzzle.protocol.state === 'connected') {
      this.disconnect();
    }

    this.kuzzle.protocol = new WebSocket(environment.host, {
      port: parseInt(environment.port),
      sslConnection: environment.ssl,
    });

    try {
      await this.kuzzle.connect();
    } catch (error: any) {
      if (error.message.match(/^Incompatible SDK client/)) {
        const e = new Error(error) as any;
        e.id = 'api.process.incompatible_sdk_version';
        throw e;
      }
    }
  }

  async getMappingDocument(collection, index) {
    // @todo Use the SDK method after
    // https://github.com/kuzzleio/sdk-javascript/pull/507 is merged
    const request = {
      controller: 'collection',
      action: 'getMapping',
      index,
      collection,
    };

    const response = await this.kuzzle.query(request);

    return response.result[index].mappings[collection];
  }

  async performDeleteDocuments(index, collection, ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !index || !collection) {
      throw new Error('ids<Array> parameter is required');
    }

    const deleted = await this.kuzzle.document.mDelete(index, collection, ids, {
      refresh: 'wait_for',
    });

    return deleted;
  }

  /*
   * La liste n'affiche, ligne repliée, que le nom d'utilisateur `local` : les
   * autres stratégies attendent le dépliage (`getUserCredentials`). Les
   * requêtes partent en parallèle — en série, une page de 25 utilisateurs et
   * deux stratégies coûtaient 52 allers-retours, plusieurs secondes sur un
   * backend distant.
   */
  async performSearchUsers(collection, index, filters = {}, pagination = {}, sort = []) {
    const [strategies, result] = await Promise.all([
      this.kuzzle.auth.getStrategies(),
      this.kuzzle.security.searchUsers({ ...filters, sort }, { ...pagination }),
    ]);
    const hasLocal = strategies.includes('local');

    const users = await Promise.all(
      result.hits.map(async (user: any) => ({
        id: user._id,
        ...user.content,
        _kuzzle_info: this.formatMeta(user.content._kuzzle_info),
        credentials: hasLocal ? await this.getUserCredentials(user._id, ['local']) : {},
      })),
    );

    return { documents: users, total: result.total };
  }

  /*
   * Les identifiants d'un utilisateur, par stratégie, limités à `only` s'il
   * est fourni. Une stratégie sans identifiants pour cet utilisateur lève :
   * elle est simplement absente du résultat.
   */
  async getUserCredentials(kuid: string, only?: string[]) {
    const strategies = only ?? (await this.kuzzle.auth.getStrategies());
    const entries = await Promise.all(
      strategies.map(async (strategy) => {
        try {
          return [strategy, await this.kuzzle.security.getCredentials(strategy, kuid)] as const;
        } catch {
          // Pas d'identifiants pour cette stratégie.
          return null;
        }
      }),
    );
    // Dans l'ordre des stratégies, pas dans celui des réponses.
    return Object.fromEntries(entries.filter((entry) => entry !== null));
  }

  getMappingUsers() {
    return this.kuzzle.security.getUserMapping();
  }

  updateMappingUsers(newMapping) {
    return this.kuzzle.security.updateUserMapping({
      properties: newMapping,
    });
  }

  performCreateUser(kuid, body) {
    return this.kuzzle.security.createUser(kuid, body, {
      refresh: 'wait_for',
    });
  }

  performReplaceUser(kuid, body) {
    return this.kuzzle.security.replaceUser(kuid, body, {
      refresh: 'wait_for',
    });
  }

  async performDeleteUsers(index, collection, ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'));
    }

    await this.kuzzle.security.mDeleteUsers(ids, {
      refresh: 'wait_for',
    });
  }

  async performSearchProfiles(filters = {}, pagination = {}) {
    const result = await this.kuzzle.security.searchProfiles(
      { ...filters },
      { size: 1000, ...pagination },
    );

    const profiles = result.hits.map((document) => {
      return omit(document, '_kuzzle');
    });
    return { documents: profiles, total: result.total };
  }

  async performDeleteProfiles(index, collection, ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'));
    }

    await this.kuzzle.security.mDeleteProfiles(ids, {
      refresh: 'wait_for',
    });
  }

  quickSearchToESQuery(searchTerm): object {
    if (!searchTerm) {
      return {};
    }

    return {
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                _all: {
                  query: searchTerm,
                },
              },
            },
            {
              match: {
                _id: searchTerm,
              },
            },
          ],
        },
      },
    };
  }

  basicSearchToESQuery(groups: object[][] = [[]], mappingAttrs: MappingAttributes): object {
    const bool: any = {};

    bool.should = groups.map((filters) => {
      const formattedFilter: any = { bool: { must: [], must_not: [] } };
      filters.forEach((filter: any) => {
        if (filter.attribute === null) {
          return;
        }

        const mustOperators = ['contains', 'equal', 'range', 'exists'];
        const mustNotOperators = ['not_contains', 'not_equal', 'not_exists'];

        let verb: any = null;
        if (mustOperators.includes(filter.operator)) {
          verb = 'must';
        } else if (mustNotOperators.includes(filter.operator)) {
          verb = 'must_not';
        }

        let filterToAdd: any = null;
        switch (filter.operator) {
          case 'contains':
          case 'not_contains':
            if (filter.attribute === '_id') {
              filterToAdd = {
                match: { [filter.attribute]: filter.value },
              };
            } else if (mappingAttrs[filter.attribute].type === 'text') {
              filterToAdd = {
                match_phrase_prefix: { [filter.attribute]: filter.value },
              };
            } else if (mappingAttrs[filter.attribute].type === 'keyword') {
              filterToAdd = {
                regexp: {
                  [filter.attribute]: '.*' + buildCaseInsensitiveRegexp(filter.value) + '.*',
                },
              };
            }
            break;
          case 'equal':
          case 'not_equal':
            filterToAdd = {
              range: {
                [filter.attribute]: {
                  gte: filter.value,
                  lte: filter.value,
                },
              },
            };
            break;
          case 'exists':
          case 'not_exists':
            filterToAdd = {
              exists: {
                field: filter.attribute,
              },
            };
            break;
          case 'range':
            filterToAdd = {
              range: {
                [filter.attribute]: {
                  gt: filter.gt_value ? filter.gt_value : null,
                  lt: filter.lt_value ? filter.lt_value : null,
                },
              },
            };
            break;
          default:
            filterToAdd = null;
        }
        if (!verb || !filterToAdd) {
          return;
        }
        formattedFilter.bool[verb].push(filterToAdd);
      });

      return formattedFilter;
    });

    if (bool.should.length === 0) {
      return {};
    }

    return { query: { bool } };
  }

  async performSearchDocuments(
    collection,
    index,
    filters = { query: {} },
    pagination = {},
    sort = [],
  ) {
    if (!collection || !index) {
      throw new Error('Missing collection or index');
    }

    const result = await this.kuzzle.document.search(
      index,
      collection,
      { ...filters, sort },
      { ...pagination },
    );

    const documents = result.hits.map((d) => ({
      _id: d._id,
      ...d._source,
      _kuzzle_info: d._source._kuzzle_info ? this.formatMeta(d._source._kuzzle_info) : undefined,
    }));

    const totalDocument = await this.kuzzle.document.count(index, collection, {
      query: filters.query,
    });

    return { documents, total: totalDocument };
  }

  async performSearchRoles(controllers = {}, pagination = {}) {
    const result = await this.kuzzle.security.searchRoles(controllers, {
      ...pagination,
    });
    const roles = result.hits.map((document) => {
      return omit(document, '_kuzzle');
    });

    return { documents: roles, total: result.total };
  }

  async getMappingRoles() {
    return this.kuzzle.security.getRoleMapping();
  }

  async performDeleteRoles(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'));
    }

    await this.kuzzle.security.mDeleteRoles(ids, {
      refresh: 'wait_for',
    });
  }
}

export const wrapper = new KuzzleWrapperV1(kuzzle);
