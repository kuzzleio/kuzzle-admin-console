export type EnvironmentColor =
  | 'darkblue'
  | 'lightblue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'red'
  | 'grey'
  | 'magenta';

export interface Environment {
  name: string;
  color: EnvironmentColor;
  host: string;
  port: number;
  ssl: boolean;
  backendMajorVersion: number;
  hideAdminWarning: boolean;
  token: string;
  // `sessionId` OpenID (Keycloak) de la session, absent pour une session
  // locale : il rouvre la session et rafraîchit le token.
  openidSessionId?: string | null;
}

export interface KuzzleState {
  environments: Record<string, Environment>;
  currentId?: string;
  connecting: boolean;
  online: boolean;
  errorFromKuzzle?: string;
}

export interface CreateEnvironmentPayload {
  id: string;
  environment: Environment;
}

export interface UpdateEnvironmentPayload {
  id: string;
  environment: Environment;
}
