import { SessionUser } from '@/models/SessionUser'

export interface AuthState {
  user: SessionUser
  tokenValid: boolean
  adminAlreadyExists: boolean
  initializing: boolean
}
