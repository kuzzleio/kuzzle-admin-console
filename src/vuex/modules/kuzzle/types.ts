export interface KuzzleState {
  environments: Object
  currentId?: string
  connecting: boolean
  online: boolean
  errorFromKuzzle?: string
}

// TODO define Environment type
