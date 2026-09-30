import type { LatLngExpression, LatLngTuple } from 'leaflet';

/* Un document tel que le rend une recherche : les champs sont sous `_source`. */
export interface KuzzleDocument {
  _id: string;
  _source: Record<string, unknown>;
}

/* La notification temps réel d'un document, pour ce que les vues en lisent. */
export interface DocumentNotification {
  action: string;
}

/* Un document de la vue carte qui porte un `geo_point` : `Page.vue` en extrait les coordonnées. */
export interface GeoDocument {
  _id: string;
  coordinates: LatLngTuple;
  source: Record<string, unknown>;
}

/*
 * Un `geo_shape` que la vue carte sait tracer — `Page.vue` écarte les autres.
 * Les coordonnées ont la forme que lisent `LCircle` et `LPolygon`.
 */
export type GeoShape =
  | { type: 'circle'; coordinates: LatLngExpression; radius?: number | string }
  | { type: 'polygon'; coordinates: LatLngExpression[] }
  | { type: 'multipolygon'; coordinates: LatLngExpression[][] };

export interface ShapeDocument<S extends GeoShape = GeoShape> {
  _id: string;
  content: S;
  source: Record<string, unknown>;
}
