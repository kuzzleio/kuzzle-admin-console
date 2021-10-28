import _ from 'lodash'

export class Index {
  private _name: string
  loading = false
  collections?: Collection[]

  constructor(name: string) {
    this._name = name
  }

  get name() {
    return this._name
  }

  get collectionsCount(): number | undefined {
    return this.collections?.length
  }

  public initCollections(collections: Collection[]) {
    this.collections = collections
  }

  public addCollection(collection: Collection) {
    if (!this.collections) {
      throw new Error(
        'Unable to perform operations, the collection list is not yet initialized'
      )
    }

    this.collections.push(collection)
  }

  public removeCollection(collection: Collection) {
    if (!this.collections) {
      throw new Error(
        'Unable to perform operations, the collection list is not yet initialized'
      )
    }

    this.collections = this.collections.filter(
      el => el.name !== collection.name
    )
  }

  public getOneCollection(collectionName: string) {
    if (!this.collections) {
      throw new Error(
        'Unable to perform operations, the collection list is not yet initialized'
      )
    }

    return this.collections.find(el => el.name === collectionName)
  }

  public doesCollectionExist(collectionName: string): boolean {
    if (!this.collections) {
      throw new Error(
        'Unable to perform operations, the collection list is not yet initialized'
      )
    }

    return this.collections.find(el => el.name === collectionName)
      ? true
      : false
  }
}

export class Collection {
  private _name: string
  private _type: CollectionType
  mapping?: object
  dynamic?: string

  constructor(name: string, type: CollectionType) {
    this._type = this.findType(name, type)
    this._name = name
  }

  get name(): string {
    return this._name
  }

  get type(): CollectionType {
    return this._type
  }

  public isRealtime(): boolean {
    return this._type === CollectionType.REALTIME
  }

  private findType(name: string, type: CollectionType) {
    if (type !== CollectionType.STORED && type !== CollectionType.REALTIME) {
      throw new Error(`Unknown collection type for "${name}" :  ${type}`)
    }

    return type === CollectionType.STORED
      ? CollectionType.STORED
      : CollectionType.REALTIME
  }
}

export enum CollectionType {
  REALTIME = 'realtime',
  STORED = 'stored'
}

export interface IndexState {
  indexes: Index[]
  loadingIndexes: boolean
}

export interface IndexCollectionPayload {
  index: Index
  collection: Collection
}

export interface IndexCollectionsPayload {
  index: Index
  collections: Collection[]
}

export interface IndexLoadingCollectionsPayload {
  index: Index
  loading: boolean
}

export interface CreateCollectionPayload {
  index: Index
  name: string
  isRealtime: boolean
  mapping: object
}

export interface UpdateCollectionPayload {
  index: Index
  name: string
  isRealtime: boolean
  mapping: object
}
