export interface KuzzleState {
  environments: Object,
  lastConnectedEnv?: string,
  connectedTo?: string,
  errorFromKuzzle?: string,
  host: string,
  port: number
}
