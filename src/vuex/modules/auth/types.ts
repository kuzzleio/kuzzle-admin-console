import { SessionUser } from '@/models/SessionUser'

export interface AuthState {
  user: SessionUser | null
  tokenValid: boolean
  adminAlreadyExists: boolean
  initializing: boolean
}
