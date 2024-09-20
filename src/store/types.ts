import type { AuthState } from './modules/Auth/types';
import type { KuzzleState } from './modules/Kuzzle/types';
import type { RoutingState } from './modules/Routing/types';
import type { IndexState } from './modules/StorageIndex/types';
import type { ToasterState } from './modules/Toaster/types';

export interface RootState {
  strict: boolean;
  auth: AuthState;
  index: IndexState;
  kuzzle: KuzzleState;
  routing: RoutingState;
  toaster: ToasterState;
}
