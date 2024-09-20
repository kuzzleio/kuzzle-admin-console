import type { Kuzzle } from 'kuzzle-sdk-v7';

import { StoreNamespaceTypes } from '../namespace-types';
import type { KuzzleWrapperV1 } from '@/services/kuzzleWrapper-v1';
import type { KuzzleWrapperV2 } from '@/services/kuzzleWrapper-v2';
import { KKuzzleGettersTypes } from './Kuzzle';

export const getKuzzleSdk = (rootGetters): Kuzzle => {
  return rootGetters[`${StoreNamespaceTypes.KUZZLE}/${KKuzzleGettersTypes.$KUZZLE}`];
};

export const getKuzzleWrapper = (rootGetters): KuzzleWrapperV1 & KuzzleWrapperV2 => {
  return rootGetters[`${StoreNamespaceTypes.KUZZLE}/${KKuzzleGettersTypes.WRAPPER}`];
};
