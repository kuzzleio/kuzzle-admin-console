import type { GetterTree } from 'vuex';

import type { SessionUser } from '@/models/SessionUser';
import type { RootState } from '@/store/types';
import { KAuthGettersTypes } from './constants/getters-types';
import type { AuthState } from './types';

const isActionAllowed = (user, controller, action, index = '*', collection = '*'): boolean => {
  if (!user) {
    return false;
  }

  const rights = user.rights || [];

  if (!rights || typeof rights !== 'object') {
    throw new Error('rights parameter is mandatory for isActionAllowed function');
  }
  if (!controller || typeof controller !== 'string') {
    throw new Error('controller parameter is mandatory for isActionAllowed function');
  }
  if (!action || typeof action !== 'string') {
    throw new Error('action parameter is mandatory for isActionAllowed function');
  }
  // We filter in all the rights that match the request (including wildcards).
  const filteredRights = rights
    .filter(function (right) {
      return right.controller === controller || right.controller === '*';
    })
    .filter(function (right) {
      return right.action === action || right.action === '*';
    })
    .filter(function (right) {
      return right.index === index || right.index === '*';
    })
    .filter(function (right) {
      return right.collection === collection || right.collection === '*';
    });

  if (
    filteredRights.some(function (item) {
      return item.value === 'allowed';
    }) &&
    filteredRights.some(function (item) {
      return item.value === 'denied';
    })
  ) {
    return false;
  } else if (
    filteredRights.some(function (item) {
      return item.value === 'allowed';
    })
  ) {
    return true;
  }
  return false;
};

export const getters: GetterTree<AuthState, RootState> = {
  [KAuthGettersTypes.IS_AUTHENTICATED](state): boolean {
    return !!state?.user?.id;
  },
  [KAuthGettersTypes.USER](state): SessionUser | null {
    return state.user;
  },
  [KAuthGettersTypes.USER_PROFILES](state): any {
    return state.user?.params?.profiles || [];
  },
  [KAuthGettersTypes.TOKEN_VALID](state): boolean {
    return state.tokenValid;
  },
  [KAuthGettersTypes.ADMIN_ALREADY_EXISTS](state): boolean {
    return state.adminAlreadyExists;
  },

  // Index
  [KAuthGettersTypes.CAN_SEARCH_INDEX](state): boolean {
    if (state.user == null) {
      return false;
    }
    const indexListRight = state.user.rights.filter(
      (rights) =>
        (rights.action === 'list' || rights.action === '*') &&
        (rights.controller === 'index' || rights.controller === '*'),
    );

    return indexListRight[0] && indexListRight[0].value === 'allowed';
  },
  [KAuthGettersTypes.CAN_CREATE_INDEX](state): boolean {
    return isActionAllowed(state.user, 'index', 'create');
  },
  [KAuthGettersTypes.CAN_DELETE_INDEX](state): (index: string) => boolean {
    return (index) => isActionAllowed(state.user, 'index', 'delete', index);
  },

  // Collection
  [KAuthGettersTypes.CAN_SEARCH_COLLECTION](state): (index: string) => boolean {
    return (index) => isActionAllowed(state.user, 'collection', 'list', index);
  },
  [KAuthGettersTypes.CAN_CREATE_COLLECTION](state): (index: string) => boolean {
    return (index) => isActionAllowed(state.user, 'collection', 'create', index);
  },
  [KAuthGettersTypes.CAN_EDIT_COLLECTION](state): (index: string, collection: string) => boolean {
    return (index, collection) =>
      isActionAllowed(state.user, 'collection', 'updateMapping', index, collection);
  },
  [KAuthGettersTypes.CAN_TRUNCATE_COLLECTION](
    state,
  ): (index: string, collection: string) => boolean {
    return (index, collection) =>
      isActionAllowed(state.user, 'collection', 'truncate', index, collection);
  },

  // Document CRUDL
  [KAuthGettersTypes.CAN_READ_DOCUMENT](state): (index: string, collection: string) => boolean {
    return (index, collection) => isActionAllowed(state.user, 'document', 'get', index, collection);
  },
  [KAuthGettersTypes.CAN_SEARCH_DOCUMENT](state): (index: string, collection: string) => boolean {
    return (index, collection) =>
      isActionAllowed(state.user, 'document', 'search', index, collection);
  },
  [KAuthGettersTypes.CAN_CREATE_DOCUMENT](state): (index: string, collection: string) => boolean {
    return (index, collection) =>
      isActionAllowed(state.user, 'document', 'create', index, collection);
  },
  [KAuthGettersTypes.CAN_EDIT_DOCUMENT](state): (index: string, collection: string) => boolean {
    return (index, collection) =>
      isActionAllowed(state.user, 'document', 'createOrReplace', index, collection);
  },
  [KAuthGettersTypes.CAN_DELETE_DOCUMENT](state): (index: string, collection: string) => boolean {
    return (index, collection) =>
      isActionAllowed(state.user, 'document', 'delete', index, collection);
  },

  // Realtime
  [KAuthGettersTypes.CAN_SUBSCRIBE](state): (index: string, collection: string) => boolean {
    return (index, collection) =>
      isActionAllowed(state.user, 'realtime', 'subscribe', index, collection) &&
      isActionAllowed(state.user, 'realtime', 'unsubscribe', index, collection);
  },
  [KAuthGettersTypes.CAN_PUBLISH](state): (index: string, collection: string) => boolean {
    return (index, collection) =>
      isActionAllowed(state.user, 'realtime', 'publish', index, collection);
  },
  [KAuthGettersTypes.CAN_MANAGE_REALTIME](
    _state,
    getters,
  ): (index: string, collection: string) => boolean {
    return (index, collection) =>
      getters[KAuthGettersTypes.CAN_SUBSCRIBE](index, collection) ||
      getters[KAuthGettersTypes.CAN_PUBLISH](index, collection);
  },
  [KAuthGettersTypes.CAN_MANAGE_DOCUMENTS](
    _state,
    getters,
  ): (index: string, collection: string) => boolean {
    return (index, collection) =>
      getters[KAuthGettersTypes.CAN_READ_DOCUMENT](index, collection) ||
      getters[KAuthGettersTypes.CAN_SEARCH_DOCUMENT](index, collection) ||
      getters[KAuthGettersTypes.CAN_EDIT_DOCUMENT](index, collection) ||
      getters[KAuthGettersTypes.CAN_CREATE_DOCUMENT](index, collection) ||
      getters[KAuthGettersTypes.CAN_DELETE_DOCUMENT](index, collection);
  },

  // Roles
  [KAuthGettersTypes.CAN_READ_ROLE](state): boolean {
    return isActionAllowed(state.user, 'security', 'getRole');
  },
  [KAuthGettersTypes.CAN_SEARCH_ROLE](state): boolean {
    return isActionAllowed(state.user, 'security', 'searchRoles');
  },
  [KAuthGettersTypes.CAN_EDIT_ROLE](state): boolean {
    return isActionAllowed(state.user, 'security', 'createOrReplaceRole');
  },
  [KAuthGettersTypes.CAN_CREATE_ROLE](state): boolean {
    return isActionAllowed(state.user, 'security', 'createRole');
  },
  [KAuthGettersTypes.CAN_DELETE_ROLE](state): boolean {
    return isActionAllowed(state.user, 'security', 'deleteRole');
  },
  [KAuthGettersTypes.CAN_MANAGE_ROLES](_state, getters): boolean {
    return (
      getters[KAuthGettersTypes.CAN_READ_ROLE] ||
      getters[KAuthGettersTypes.CAN_SEARCH_ROLE] ||
      getters[KAuthGettersTypes.CAN_EDIT_ROLE] ||
      getters[KAuthGettersTypes.CAN_CREATE_ROLE] ||
      getters[KAuthGettersTypes.CAN_DELETE_ROLE]
    );
  },

  // Profiles
  [KAuthGettersTypes.CAN_READ_PROFILE](state): boolean {
    return isActionAllowed(state.user, 'security', 'getProfile');
  },
  [KAuthGettersTypes.CAN_SEARCH_PROFILE](state): boolean {
    return isActionAllowed(state.user, 'security', 'searchProfiles');
  },
  [KAuthGettersTypes.CAN_EDIT_PROFILE](state): boolean {
    return isActionAllowed(state.user, 'security', 'createOrReplaceProfile');
  },
  [KAuthGettersTypes.CAN_CREATE_PROFILE](state): boolean {
    return isActionAllowed(state.user, 'security', 'createProfile');
  },
  [KAuthGettersTypes.CAN_DELETE_PROFILE](state): boolean {
    return isActionAllowed(state.user, 'security', 'deleteProfile');
  },
  [KAuthGettersTypes.CAN_MANAGE_PROFILES](_state, getters): boolean {
    return (
      getters[KAuthGettersTypes.CAN_READ_PROFILE] ||
      getters[KAuthGettersTypes.CAN_SEARCH_PROFILE] ||
      getters[KAuthGettersTypes.CAN_EDIT_PROFILE] ||
      getters[KAuthGettersTypes.CAN_CREATE_PROFILE] ||
      getters[KAuthGettersTypes.CAN_DELETE_PROFILE]
    );
  },

  // Users
  [KAuthGettersTypes.CAN_READ_USER](state): boolean {
    return isActionAllowed(state.user, 'security', 'getUser');
  },
  [KAuthGettersTypes.CAN_SEARCH_USER](state): boolean {
    return isActionAllowed(state.user, 'security', 'searchUsers');
  },
  [KAuthGettersTypes.CAN_EDIT_USER](state): boolean {
    return isActionAllowed(state.user, 'security', 'updateUser');
  },
  [KAuthGettersTypes.CAN_CREATE_USER](state): boolean {
    return isActionAllowed(state.user, 'security', 'createUser');
  },
  [KAuthGettersTypes.CAN_DELETE_USER](state): boolean {
    return isActionAllowed(state.user, 'security', 'deleteUser');
  },
  [KAuthGettersTypes.CAN_MANAGE_USERS](_state, getters): boolean {
    return (
      getters[KAuthGettersTypes.CAN_READ_USER] ||
      getters[KAuthGettersTypes.CAN_SEARCH_USER] ||
      getters[KAuthGettersTypes.CAN_EDIT_USER] ||
      getters[KAuthGettersTypes.CAN_CREATE_USER] ||
      getters[KAuthGettersTypes.CAN_DELETE_USER]
    );
  },
  [KAuthGettersTypes.HAS_SECURITY_RIGHTS](_state, getters): boolean {
    return (
      getters[KAuthGettersTypes.CAN_MANAGE_ROLES] ||
      getters[KAuthGettersTypes.CAN_MANAGE_PROFILES] ||
      getters[KAuthGettersTypes.CAN_MANAGE_USERS]
    );
  },

  // Server
  [KAuthGettersTypes.CAN_GET_PUBLIC_API](state): boolean {
    return isActionAllowed(state.user, 'server', 'publicApi');
  },
  [KAuthGettersTypes.CAN_GET_OPEN_API](state): boolean {
    return isActionAllowed(state.user, 'server', 'openapi');
  },
};
