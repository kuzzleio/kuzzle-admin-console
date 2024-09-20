import type { KuzzleState } from './types';

export const state: KuzzleState = {
  environments: {},
  currentId: undefined,
  connecting: true,
  online: false,
  errorFromKuzzle: undefined,
};
