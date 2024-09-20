import { SessionUser } from '@/models/SessionUser';
import type { AuthState } from './types';

export const state: AuthState = {
  user: new SessionUser(),
  tokenValid: false,
  adminAlreadyExists: false,
  initializing: true,
};
