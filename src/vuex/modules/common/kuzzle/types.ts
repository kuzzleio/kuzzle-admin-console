export interface KuzzleState {
  environments: Object
  currentId?: string
  isConnected: boolean
  errorFromKuzzle?: string
  host: string
  port: number
}
