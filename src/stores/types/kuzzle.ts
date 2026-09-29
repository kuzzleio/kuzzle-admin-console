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
  // Absent tant qu'aucune session n'a été ouverte, `null` après une
  // déconnexion (`updateTokenCurrentEnvironment(null)`).
  token?: string | null;
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
