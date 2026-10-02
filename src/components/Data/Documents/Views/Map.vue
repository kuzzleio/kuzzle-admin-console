<template>
  <div class="ViewMap" data-cy="mapView">
    <div class="mb-3 flex flex-row items-center gap-6">
      <div class="flex grow flex-row items-center gap-6">
        <div v-if="mappingGeopoints.length" class="flex items-center gap-2 text-sm">
          <span id="mapView-geopointLabel">GeoPoint field</span>
          <Select :model-value="selectedGeopoint || ''" @update:modelValue="onSelectGeopoint">
            <SelectTrigger
              aria-labelledby="mapView-geopointLabel"
              class="w-auto min-w-40"
              data-cy="mapView-geopointSelector"
            >
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="field of mappingGeopoints" :key="field" :value="field">
                {{ field }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-if="mappingGeoshapes.length" class="flex items-center gap-2 text-sm">
          <span id="mapView-geoshapeLabel">GeoShape field</span>
          <Select :model-value="selectedGeoshape || ''" @update:modelValue="onSelectGeoshape">
            <SelectTrigger
              aria-labelledby="mapView-geoshapeLabel"
              class="w-auto min-w-40"
              data-cy="mapView-geoshapeSelector"
            >
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="field of mappingGeoshapes" :key="field" :value="field">
                {{ field }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <PerPageSelector
        :current-page-size="currentPageSize"
        :total-documents="totalDocuments"
        @change-page-size="$emit('change-page-size', $event)"
      />
    </div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 h-96 md:col-span-8 md:h-150">
        <l-map data-cy="mapView-map" @ready="onMapReady">
          <l-tile-layer :url="url" :attribution="attribution" />
          <l-marker
            v-for="document in geoDocuments"
            :key="document._id"
            :lat-lng="document.coordinates"
            :icon="getIcon(document)"
            @click="onPointClicked(document)"
          />
          <!--
            La classe de sélection passe par `class-name`, l'option Leaflet, et
            non par `:class`. Un composant de couche ne rend aucun élément dans
            le DOM — le tracé est un `<path>` SVG créé par Leaflet — donc un
            `:class` n'a nulle part où atterrir (G-043). `class-name` n'étant
            posée qu'à la création du tracé, la clé porte l'état de sélection :
            en changer recrée la couche, ce qui est le seul moyen d'en changer.
          -->
          <l-circle
            v-for="shape of circleShapes"
            :key="`${shape._id}-${getShapeCyClasse(shape)}`"
            :lat-lng="shape.content.coordinates"
            :radius="getRadiusInMeter(shape.content.radius) ?? undefined"
            :color="getShapeColor(shape._id)"
            :class-name="shapeClassName(shape)"
            @click="onCircleClicked(shape)"
          />
          <l-polygon
            v-for="shape of polygonShapes"
            :key="`${shape._id}-${getShapeCyClasse(shape)}`"
            :lat-lngs="shape.content.coordinates"
            :color="getShapeColor(shape._id)"
            :class-name="shapeClassName(shape)"
            @click="onShapeClicked(shape, shape.content.coordinates)"
          />
          <div v-for="shape of multiPolygonShapes" :key="shape._id">
            <l-polygon
              v-for="(polygon, polygonIndex) in shape.content.coordinates"
              :key="`${shape._id}-${polygonIndex}-${getShapeCyClasse(shape)}`"
              :lat-lngs="polygon"
              :color="getShapeColor(shape._id)"
              :class-name="shapeClassName(shape)"
              @click="onShapeClicked(shape, polygon)"
            />
          </div>
        </l-map>
      </div>
      <div class="col-span-12 md:col-span-4">
        <Card
          v-if="currentDocument"
          class="h-150 gap-3 py-4"
          data-cy="mapView-current-document-card"
        >
          <CardHeader class="flex-row items-center justify-between gap-2 px-4 pb-2">
            <span class="truncate font-medium" data-cy="mapView-current-document-id">
              {{ currentDocument._id }}
            </span>
            <div class="flex shrink-0 items-center gap-1">
              <Button
                class="DocumentMapItem-update"
                :data-cy="`DocumentMapItem-update--${currentDocument._id}`"
                :disabled="!canEdit"
                size="icon"
                :title="canEdit ? 'Edit Document' : 'You are not allowed to edit this Document'"
                variant="ghost"
                @click="editCurrentDocument"
              >
                <i aria-hidden="true" class="fa fa-pencil-alt" />
              </Button>
              <Button
                class="DocumentListItem-delete"
                :data-cy="`DocumentListItem-delete--${currentDocument._id}`"
                :disabled="!canDelete"
                size="icon"
                :title="
                  canDelete ? 'Delete Document' : 'You are not allowed to delete this Document'
                "
                variant="ghost"
                @click="deleteCurrentDocument"
              >
                <i aria-hidden="true" class="fa fa-trash" />
              </Button>
              <Button size="icon" title="Close" variant="ghost" @click="closeDocument">
                <i aria-hidden="true" class="fa fa-times" />
              </Button>
            </div>
          </CardHeader>
          <CardContent class="min-h-0 grow px-4">
            <JsonTree class="m-0 h-full overflow-auto" :value="currentDocument" />
          </CardContent>
        </Card>
        <Card
          v-else
          class="h-150 items-center justify-center bg-muted"
          data-cy="mapView-no-document-card"
        >
          <CardContent class="flex items-center gap-4">
            <i aria-hidden="true" class="fa fa-3x fa-search text-muted-foreground" />
            <div>
              <h3 class="m-0 text-title font-bold text-muted-foreground">No document selected.</h3>
              <p class="m-0 text-sm text-muted-foreground">
                <em>You can view a document content by clicking on a marker</em>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue';
import { LCircle, LMap, LMarker, LPolygon, LTileLayer } from '@vue-leaflet/vue-leaflet';
import L, { type LatLngExpression } from 'leaflet';

import '@/assets/leaflet.css';
import type { GeoDocument, GeoShape, ShapeDocument } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores';

import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';
import PerPageSelector from '@/components/Common/PerPageSelector.vue';

type CircleShape = Extract<GeoShape, { type: 'circle' }>;
type PolygonShape = Extract<GeoShape, { type: 'polygon' }>;
type MultiPolygonShape = Extract<GeoShape, { type: 'multipolygon' }>;

/* Des coordonnées imbriquées sur un nombre de niveaux quelconque. */
type NestedLatLngs = (LatLngExpression | NestedLatLngs)[];

const props = withDefaults(
  defineProps<{
    collection?: string;
    currentPageSize?: number;
    geoDocuments: GeoDocument[];
    index?: string;
    mappingGeopoints: string[];
    mappingGeoshapes: string[];
    selectedGeopoint: string;
    selectedGeoshape: string;
    shapesDocuments?: ShapeDocument[];
  }>(),
  {
    collection: undefined,
    currentPageSize: 25,
    index: undefined,
    shapesDocuments: () => [],
  },
);

const emit = defineEmits<{
  (e: 'change-page-size', size: number): void;
  (e: 'delete', id: string): void;
  (e: 'edit', id: string): void;
  (e: 'on-select-geopoint', field: string): void;
  (e: 'on-select-geoshape', field: string): void;
}>();

const authStore = useAuthStore();

// L'adresse que recommande OpenStreetMap, en HTTPS et sans sous-domaines
// `{s}` : `http://{s}.tile.osm.org` chargeait des tuiles en clair dans une
// page servie en HTTPS. C'est l'origine qu'autorise `img-src` (ADR-0065).
const url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/*
 * Les options d'une icône de marqueur. `L.Icon.extend` en faisait deux
 * classes, instanciées avec la seule `className` : une icône construite avec
 * toutes ses options a les mêmes, et le typage de Leaflet ne donne pas de
 * constructeur à une classe étendue.
 */
const ICON_OPTIONS: Omit<L.IconOptions, 'iconUrl'> = {
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};

// La carte n'est pas un état : le template ne la lit pas, seules les méthodes
// l'appellent. Elle reste donc hors de la réactivité, sans proxy.
let map: L.Map | null = null;
const currentDocument = ref<GeoDocument | ShapeDocument | null>(null);

const totalDocuments = computed((): number => props.geoDocuments.length);

const circleShapes = computed(() =>
  props.shapesDocuments.filter(
    (shape): shape is ShapeDocument<CircleShape> => shape.content?.type === 'circle',
  ),
);

const polygonShapes = computed(() =>
  props.shapesDocuments.filter(
    (shape): shape is ShapeDocument<PolygonShape> => shape.content?.type === 'polygon',
  ),
);

const multiPolygonShapes = computed(() =>
  props.shapesDocuments.filter(
    (shape): shape is ShapeDocument<MultiPolygonShape> => shape.content?.type === 'multipolygon',
  ),
);

const coordinates = computed((): LatLngExpression[] => [
  ...props.geoDocuments.map((d) => d.coordinates),
  ...getShapesCoordinates(),
]);

const canEdit = computed((): boolean => {
  if (!props.index || !props.collection) {
    return false;
  }
  return authStore.canEditDocument(props.index, props.collection);
});

const canDelete = computed((): boolean => {
  if (!props.index || !props.collection) {
    return false;
  }
  return authStore.canDeleteDocument(props.index, props.collection);
});

watch(
  () => props.selectedGeopoint,
  (value) => {
    if (value) {
      map?.fitBounds(L.latLngBounds(coordinates.value), { maxZoom: 12 });
    }
  },
);

watch(
  () => props.selectedGeoshape,
  (value) => {
    if (value) {
      map?.fitBounds(L.latLngBounds(coordinates.value), { maxZoom: 12 });
    }
  },
);

function onSelectGeopoint(value: unknown): void {
  if (typeof value === 'string') {
    emit('on-select-geopoint', value);
  }
}

function onSelectGeoshape(value: unknown): void {
  if (typeof value === 'string') {
    emit('on-select-geoshape', value);
  }
}

/*
 * `@vue-leaflet/vue-leaflet` crée son objet Leaflet de façon asynchrone et
 * le signale par `ready` — il n'existe pas au `mounted` du parent, ni au
 * `$nextTick` qui suffisait à `vue2-leaflet`. C'est l'événement qui donne
 * la carte, pas le cycle de vie (ADR-0027).
 */
function onMapReady(leafletMap: L.Map): void {
  map = leafletMap;

  const bounds = L.latLngBounds(coordinates.value);
  if (bounds.isValid()) {
    map.fitBounds(bounds, { maxZoom: 12 });
  }
}

function shapeClassName(shape: ShapeDocument): string {
  return `data-cy-shape data-cy-shape-${shape._id} ${getShapeCyClasse(shape)}`.trim();
}

function getShapeCyClasse(shape: ShapeDocument): string {
  return currentDocument.value && currentDocument.value._id === shape._id
    ? 'data-cy-shape-selected'
    : '';
}

function getShapeColor(id: string): string {
  return currentDocument.value && currentDocument.value._id === id ? '#26AD23' : '#2981CA';
}

function getRadiusInMeter(radius: unknown): number | null {
  if (typeof radius === 'number') {
    return radius;
  }
  if (typeof radius !== 'string') {
    return null;
  }
  const value = parseInt(radius);
  const unit = radius.replace(value.toString(), '');
  let multiplicator: number;
  switch (unit) {
    case 'km':
      multiplicator = 1000;
      break;
    default:
      multiplicator = 1;
  }
  return value * multiplicator;
}

function isNested(value: LatLngExpression | NestedLatLngs): value is NestedLatLngs {
  return Array.isArray(value) && typeof value[0] !== 'number';
}

function flattenShapes(arr: NestedLatLngs): LatLngExpression[] {
  return arr.reduce<LatLngExpression[]>(
    (a, b) => (isNested(b) ? a.concat(flattenShapes(b)) : a.concat([b])),
    [],
  );
}

function getShapesCoordinates(): LatLngExpression[] {
  const circlePoints = circleShapes.value.map((circle) => circle.content.coordinates);

  const polygonArrays = polygonShapes.value.map((polygon) => polygon.content.coordinates);

  const multipolygonArrays = [
    ...multiPolygonShapes.value.map((multipolygon) => multipolygon.content.coordinates),
  ];

  return [...circlePoints, ...flattenShapes(polygonArrays), ...flattenShapes(multipolygonArrays)];
}

/*
 * Affiche le document cliqué, ou referme sa fiche s'il l'était déjà.
 * `currentDocument` se relit à travers un proxy réactif, `document` vient
 * brut des props : sans `toRaw`, les deux ne sont jamais égaux (G-122).
 */
function toggleDocument(document: GeoDocument | ShapeDocument): boolean {
  if (toRaw(currentDocument.value) === document) {
    currentDocument.value = null;
    return false;
  }
  currentDocument.value = document;
  return true;
}

function onPointClicked(document: GeoDocument): void {
  if (toggleDocument(document)) {
    map?.setView(document.coordinates, 14);
  }
}

function onShapeClicked(shape: ShapeDocument, latlngs: LatLngExpression[]): void {
  if (toggleDocument(shape)) {
    map?.fitBounds(L.latLngBounds(latlngs), { maxZoom: 14 });
  }
}

function onCircleClicked(shape: ShapeDocument<CircleShape>): void {
  if (toggleDocument(shape)) {
    const radiusInMeter = getRadiusInMeter(shape.content.radius);
    const bounds = L.latLng(shape.content.coordinates).toBounds((radiusInMeter ?? 0) * 2);
    // Le zoom maximal passe par les options : un nombre en second argument
    // était ignoré, et un petit cercle zoomait au maximum (G-121).
    map?.fitBounds(bounds, { maxZoom: 14 });
  }
}

function closeDocument(): void {
  currentDocument.value = null;
}

function getIcon(document: GeoDocument): L.Icon {
  if (currentDocument.value?._id === document._id) {
    return new L.Icon({
      ...ICON_OPTIONS,
      iconUrl: '/images/marker-icon-2x-green.png',
      className: `mapView-marker-selected documentId-${document._id}`,
    });
  }

  return new L.Icon({
    ...ICON_OPTIONS,
    iconUrl: '/images/marker-icon-2x-blue.png',
    className: `mapView-marker-default documentId-${document._id}`,
  });
}

function deleteCurrentDocument(): void {
  if (canDelete.value && currentDocument.value) {
    emit('delete', currentDocument.value._id);
  }
}

function editCurrentDocument(): void {
  if (canEdit.value && currentDocument.value) {
    emit('edit', currentDocument.value._id);
  }
}
</script>
