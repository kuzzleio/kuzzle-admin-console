export class Index {
  readonly name: string;
  loading = false;
  collections?: Collection[];

  constructor(name: string) {
    this.name = name;
  }

  get collectionsCount(): number | undefined {
    return this.collections?.length;
  }

  public initCollections(collections: Collection[]): void {
    this.collections = collections;
  }

  public addCollection(collection: Collection): void {
    if (this.collections == null) {
      throw new Error('Unable to perform operations, the collection list is not yet initialized');
    }

    this.collections.push(collection);
  }

  public removeCollection(collection: Collection): void {
    if (this.collections == null) {
      throw new Error('Unable to perform operations, the collection list is not yet initialized');
    }

    this.collections = this.collections.filter((el) => el.name !== collection.name);
  }

  public getOneCollection(collectionName: string): Collection | undefined {
    if (this.collections == null) {
      throw new Error('Unable to perform operations, the collection list is not yet initialized');
    }

    return this.collections.find((el) => el.name === collectionName);
  }

  public doesCollectionExist(collectionName: string): boolean {
    if (this.collections == null) {
      throw new Error('Unable to perform operations, the collection list is not yet initialized');
    }

    return this.collections.find((el) => el.name === collectionName) != null;
  }
}

/*
 * Hors de la classe, et non en méthode privée : Pinia rend l'état déballé
 * (`UnwrapRef`), dont le type perd les membres privés. Un `Collection`
 * déballé cessait alors d'être assignable à `Collection`, et un `Index` du
 * store à `Index` (G-115).
 */
function findType(name: string, type: CollectionType): CollectionType {
  if (type !== 'stored' && type !== 'realtime') {
    throw new Error(`Unknown collection type for "${name}" :  ${String(type)}`);
  }

  return type;
}

export class Collection {
  readonly name: string;
  readonly type: CollectionType;
  mapping?: object;
  dynamic?: string;

  constructor(name: string, type: CollectionType) {
    this.type = findType(name, type);
    this.name = name;
  }

  public isRealtime(): boolean {
    return this.type === 'realtime';
  }
}

export type CollectionType = 'realtime' | 'stored';

export interface IndexState {
  indexes: Index[];
  loadingIndexes: boolean;
}

export interface IndexCollectionPayload {
  index: Index;
  collection: Collection;
}

export interface IndexCollectionsPayload {
  index: Index;
  collections: Collection[];
}

export interface IndexLoadingCollectionsPayload {
  index: Index;
  loading: boolean;
}

export interface CreateCollectionPayload {
  index: Index;
  name: string;
  isRealtime: boolean;
  mapping: object;
}

export interface UpdateCollectionPayload {
  index: Index;
  name: string;
  isRealtime: boolean;
  mapping: object;
}
