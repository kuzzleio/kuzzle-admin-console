import type { SessionUser } from '@/models/SessionUser';

export interface AuthState {
  strategy: 'local' | 'keycloak';
  user: SessionUser | null;
  tokenValid: boolean;
  adminAlreadyExists: boolean;
  initializing: boolean;
}
