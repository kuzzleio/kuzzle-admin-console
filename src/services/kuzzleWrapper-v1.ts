import { Kuzzle, WebSocket } from 'kuzzle-sdk-v6'
import Promise from 'bluebird'
import omit from 'lodash/omit'
import { MappingAttributes } from './mappingHelpers'

// NOTE - We instantiate a new Kuzzle SDK with Websocket protocol
// pointing to `localhost` because we cannot instantiate the `WebSocket`
// class with `null` argument. The SDK will not initiate a connection to
// `localhost` as the call to `connect()` is performed in the `connectToEnvironment`
// method, which instantiates a new `WebSocket` class with the hostname
// corresponding to the selected environment.
export const kuzzle = new Kuzzle(new WebSocket('localhost'))

// Helper for performSearch
let getValueAdditionalAttribute = (content, attributePath) => {
  let attribute = attributePath.shift()

  if (typeof content[attribute] === 'object') {
    return getValueAdditionalAttribute(content[attribute], attributePath)
  }

  return content[attribute]
}

function buildCaseInsensitiveRegexp(searchString) {
  return searchString
    .split('')
    .map(letter => {
      if ('.-'.indexOf(letter) >= 0) {
        return `\\${letter}`
      }
      if ('#@'.indexOf(letter) >= 0) {
        return letter
      }
      return `[${letter.toLowerCase()}${letter.toUpperCase()}]`
    })
    .join('')
}

export class KuzzleWrapperV1 {
  version: string = '1'
  kuzzle: any = null

  constructor(sdk) {
    this.kuzzle = sdk
  }

  formatMeta(_kuzzle_info) {
    return {
      author:
        _kuzzle_info.author === '-1' ? 'Anonymous (-1)' : _kuzzle_info.author,
      updater:
        _kuzzle_info.updater === '-1' ? 'Anonymous (-1)' : _kuzzle_info.updater,
      createdAt: _kuzzle_info.createdAt,
      updatedAt: _kuzzle_info.updatedAt
    }
  }

  disconnect() {
    this.kuzzle.disconnect()
    this.kuzzle.jwt = null
  }

  async connectToEnvironment(environment) {
    // fix default port for users that have an old environment settings in their localStorage:
    if (environment.port === undefined) environment.port = 7512
    if (typeof environment.ssl !== 'boolean') environment.ssl = false

    if (this.kuzzle.protocol.state === 'connected') {
      this.disconnect()
    }

    this.kuzzle.protocol = new WebSocket(environment.host, {
      port: parseInt(environment.port),
      sslConnection: environment.ssl
    })

    try {
      await this.kuzzle.connect()
    } catch (error) {
      if (error.message.match(/^Incompatible SDK client/)) {
        const e = new Error(error)
        e['id'] = 'api.process.incompatible_sdk_version'
        throw e
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
      collection
    }

    const response = await this.kuzzle.query(request)

    return response.result[index].mappings[collection]
  }

  async performDeleteDocuments(index, collection, ids) {
    if (
      !ids ||
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !index ||
      !collection
    ) {
      throw new Error('ids<Array> parameter is required')
    }

    const deleted = await this.kuzzle.document.mDelete(index, collection, ids, {
      refresh: 'wait_for'
    })

    return deleted
  }

  async performSearchUsers(
    collection,
    index,
    filters = {},
    pagination = {},
    sort = []
  ) {
    const strategies = await this.kuzzle.auth.getStrategies()

    const result = await this.kuzzle.security.searchUsers(
      { ...filters, sort },
      { ...pagination }
    )
    let additionalAttributeName: any = null

    if (sort.length > 0) {
      if (typeof sort[0] === 'string') {
        additionalAttributeName = sort[0]
      } else {
        additionalAttributeName = Object.keys(sort[0])[0]
      }
    }

    const users: Array<any> = []
    for (const user of result.hits) {
      const formattedUser: any = {
        id: user._id,
        ...user.content,
        _kuzzle_info: this.formatMeta(user.content._kuzzle_info),
        credentials: {}
      }
      for (const strategy of strategies) {
        try {
          const res = await this.kuzzle.security.getCredentials(
            strategy,
            user._id
          )
          formattedUser.credentials[strategy] = res
        } catch (e) {
          formattedUser.credentials[strategy] = {}
        }
      }

      users.push(formattedUser)
    }

    return { documents: users, total: result.total }
  }

  getMappingUsers() {
    return this.kuzzle.security.getUserMapping()
  }

  updateMappingUsers(newMapping) {
    return this.kuzzle.security.updateUserMapping({
      properties: newMapping
    })
  }

  performCreateUser(kuid, body) {
    return this.kuzzle.security.createUser(kuid, body, {
      refresh: 'wait_for'
    })
  }

  performReplaceUser(kuid, body) {
    return this.kuzzle.security.replaceUser(kuid, body, {
      refresh: 'wait_for'
    })
  }

  async performDeleteUsers(index, collection, ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'))
    }

    await this.kuzzle.security.mDeleteUsers(ids, {
      refresh: 'wait_for'
    })
  }

  async performSearchProfiles(filters = {}, pagination = {}) {
    const result = await this.kuzzle.security.searchProfiles(
      { ...filters },
      { size: 100, ...pagination }
    )

    const profiles = result.hits.map(document => {
      return omit(document, '_kuzzle')
    })
    return { documents: profiles, total: result.total }
  }

  async performDeleteProfiles(index, collection, ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'))
    }

    await this.kuzzle.security.mDeleteProfiles(ids, {
      refresh: 'wait_for'
    })
  }

  quickSearchToESQuery(searchTerm): object {
    if (!searchTerm) {
      return {}
    }

    return {
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                _all: {
                  query: searchTerm
                }
              }
            },
            {
              match: {
                _id: searchTerm
              }
            }
          ]
        }
      }
    }
  }

  basicSearchToESQuery(groups = [[]], mappingAttrs: MappingAttributes): object {
    let bool: any = {}

    bool.should = groups.map(filters => {
      let formattedFilter: any = { bool: { must: [], must_not: [] } }
      filters.forEach((filter: any) => {
        if (filter.attribute === null) {
          return
        }

        // TODO Convert this into a big switch/case
        if (filter.operator === 'contains') {
          if (mappingAttrs[filter.attribute].type === 'text') {
            formattedFilter.bool.must.push({
              match_phrase_prefix: { [filter.attribute]: filter.value }
            })
          }
          if (mappingAttrs[filter.attribute].type === 'keyword') {
            formattedFilter.bool.must.push({
              regexp: {
                [filter.attribute]:
                  '.*' + buildCaseInsensitiveRegexp(filter.value) + '.*'
              }
            })
          }
        } else if (filter.operator === 'not_contains') {
          if (mappingAttrs[filter.attribute].type === 'text') {
            formattedFilter.bool.must_not.push({
              match_phrase_prefix: { [filter.attribute]: filter.value }
            })
          }
          if (mappingAttrs[filter.attribute].type === 'keyword') {
            formattedFilter.bool.must_not.push({
              regexp: {
                [filter.attribute]:
                  '.*' + buildCaseInsensitiveRegexp(filter.value) + '.*'
              }
            })
          }
        } else if (filter.operator === 'equal') {
          formattedFilter.bool.must.push({
            range: {
              [filter.attribute]: {
                gte: filter.value,
                lte: filter.value
              }
            }
          })
        } else if (filter.operator === 'not_equal') {
          formattedFilter.bool.must_not.push({
            range: {
              [filter.attribute]: {
                gte: filter.value,
                lte: filter.value
              }
            }
          })
        } else if (filter.operator === 'range') {
          const range = { range: {} }
          if (filter.gt_value && filter.lt_value) {
            range.range = {
              [filter.attribute]: {
                gt: filter.gt_value,
                lt: filter.lt_value
              }
            }
          } else if (filter.gt_value && !filter.lt_value) {
            range.range = {
              [filter.attribute]: {
                gt: filter.gt_value
              }
            }
          } else {
            range.range = {
              [filter.attribute]: {
                lt: filter.lt_value
              }
            }
          }
          formattedFilter.bool.must.push(range)
        } else if (filter.operator === 'exists') {
          const exists = {
            exists: {
              field: filter.attribute
            }
          }
          formattedFilter.bool.must.push(exists)
        } else if (filter.operator === 'not_exists') {
          const exists = {
            exists: {
              field: filter.attribute
            }
          }
          formattedFilter.bool.must_not.push(exists)
        }
      })

      return formattedFilter
    })

    if (bool.should.length === 0) {
      return {}
    }

    return { query: { bool } }
  }

  async performSearchDocuments(
    collection,
    index,
    filters = { query: {} },
    pagination = {},
    sort = []
  ) {
    if (!collection || !index) {
      throw new Error('Missing collection or index')
    }

    const result = await this.kuzzle.document.search(
      index,
      collection,
      { ...filters, sort },
      { ...pagination }
    )

    const documents = result.hits.map(d => ({
      id: d._id,
      ...d._source,
      _kuzzle_info: d._source._kuzzle_info
        ? this.formatMeta(d._source._kuzzle_info)
        : undefined
    }))

    const totalDocument = await this.kuzzle.document.count(index, collection, {
      query: filters.query
    })

    return { documents, total: totalDocument }
  }

  async performSearchRoles(controllers = {}, pagination = {}) {
    const result = await this.kuzzle.security.searchRoles(controllers, {
      ...pagination
    })
    let roles = result.hits.map(document => {
      return omit(document, '_kuzzle')
    })

    return { documents: roles, total: result.total }
  }

  async getMappingRoles() {
    return this.kuzzle.security.getRoleMapping()
  }

  async performDeleteRoles(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('ids<Array> parameter is required'))
    }

    await this.kuzzle.security.mDeleteRoles(ids, {
      refresh: 'wait_for'
    })
  }

  query(payload) {
      return this.kuzzle.query(payload)
  }
}

export const wrapper = new KuzzleWrapperV1(kuzzle)
