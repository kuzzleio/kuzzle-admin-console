import { AuthState } from './types';
import { SessionUser } from '@/models/SessionUser';
import { createGetters } from "direct-vuex"

export const getters = createGetters<AuthState>()({
  isAuthenticated(state): boolean {
    return !!state?.user?.id
  },
  user(state): SessionUser {
    return state.user
  },
  tokenValid(state): boolean {
    return state.tokenValid
  },
  adminAlreadyExists(state): boolean {
    return state.adminAlreadyExists
  }
})
