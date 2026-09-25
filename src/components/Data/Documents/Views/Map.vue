<template>
  <div class="ViewMap" data-cy="mapView">
    <div class="mb-3 flex flex-row items-center gap-6">
      <div class="flex grow flex-row items-center gap-6">
        <div v-if="mappingGeopoints.length" class="flex items-center gap-2 text-sm">
          <span id="mapView-geopointLabel">GeoPoint field</span>
          <Select
            :model-value="selectedGeopoint || ''"
            @update:modelValue="$emit('on-select-geopoint', $event)"
          >
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
          <Select
            :model-value="selectedGeoshape || ''"
            @update:modelValue="$emit('on-select-geoshape', $event)"
          >
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
      <div class="col-span-8 h-150">
        <l-map ref="map" data-cy="mapView-map" @ready="onMapReady">
          <l-tile-layer :url="url" :attribution="attribution" />
          <l-marker
            v-for="document in geoDocuments"
            :key="document._id"
            :lat-lng="document.coordinates"
            :icon="getIcon(document)"
            @click="onItemClicked(document, document.coordinates, 'point')"
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
            :ref="`circle-${shape._id}`"
            :key="`${shape._id}-${getShapeCyClasse(shape)}`"
            :lat-lng="shape.content.coordinates"
            :radius="getRadiusInMeter(shape.content.radius)"
            :color="getShapeColor(shape._id)"
            :class-name="shapeClassName(shape)"
            @click="onItemClicked(shape, shape.content.coordinates, 'circle', shape.content.radius)"
          />
          <l-polygon
            v-for="shape of polygonShapes"
            :ref="`polygon-${shape._id}`"
            :key="`${shape._id}-${getShapeCyClasse(shape)}`"
            :lat-lngs="shape.content.coordinates"
            :color="getShapeColor(shape._id)"
            :class-name="shapeClassName(shape)"
            @click="onItemClicked(shape, shape.content.coordinates, 'array')"
          />
          <div v-for="shape of multiPolygonShapes" :key="shape._id">
            <l-polygon
              v-for="(polygon, index) in shape.content.coordinates"
              :ref="`polygon-${shape._id}-${index}`"
              :key="`${shape._id}-${index}-${getShapeCyClasse(shape)}`"
              :lat-lngs="polygon"
              :color="getShapeColor(shape._id)"
              :class-name="shapeClassName(shape)"
              @click="onItemClicked(shape, polygon, 'array')"
            />
          </div>
        </l-map>
      </div>
      <div class="col-span-4">
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
            <pre
              v-json-formatter="{
                content: currentDocument,
                open: true,
              }"
              class="json-formatter m-0 h-full overflow-auto"
            />
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
              <h3 class="m-0 text-lg font-bold text-muted-foreground">No document selected.</h3>
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

<script>
import { LCircle, LMap, LMarker, LPolygon, LTileLayer } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import get from 'lodash/get';
import { mapState } from 'pinia';

import '@/assets/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import JsonFormatter from '@/directives/json-formatter.directive';
import { useAuthStore } from '@/stores';

import PerPageSelector from '@/components/Common/PerPageSelector.vue';

export default {
  name: 'ViewMap',
  components: {
    Button,
    Card,
    CardContent,
    CardHeader,
    LMap,
    LTileLayer,
    LMarker,
    LCircle,
    LPolygon,
    PerPageSelector,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  },
  directives: {
    JsonFormatter,
  },
  props: {
    currentPageSize: {
      type: Number,
      default: 25,
    },
    selectedGeopoint: {
      type: String,
      required: true,
    },
    selectedGeoshape: {
      type: String,
      required: true,
    },
    mappingGeopoints: {
      type: Array,
      required: true,
    },
    mappingGeoshapes: {
      type: Array,
      required: true,
    },
    geoDocuments: {
      type: Array,
      required: true,
    },
    shapesDocuments: {
      type: Array,
      require: true,
    },
    index: String,
    collection: String,
  },
  data() {
    return {
      latField: null,
      lngField: null,
      map: null,
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentDocument: null,
      LeafDefaultIcon: L.Icon.extend({
        options: {
          iconUrl: '/images/marker-icon-2x-blue.png',
          shadowUrl: '/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        },
      }),
      defaultIcon: new L.Icon({
        iconUrl: '/images/marker-icon-2x-blue.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'mapView-marker-default',
      }),
      LeafSelectedIcon: L.Icon.extend({
        options: {
          iconUrl: '/images/marker-icon-2x-green.png',
          shadowUrl: '/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        },
      }),
      selectedIcon: new L.Icon({
        iconUrl: '/images/marker-icon-2x-green.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'mapView-marker-selected',
      }),
    };
  },
  computed: {
    totalDocuments() {
      return this.geoDocuments.length;
    },
    ...mapState(useAuthStore, ['canEditDocument', 'canDeleteDocument']),
    coordinates() {
      const coordinates = [
        ...this.geoDocuments.map((d) => d.coordinates),
        ...this.getShapesCoordinates(),
      ];
      return coordinates;
    },
    canEdit() {
      if (!this.index || !this.collection) {
        return false;
      }
      return this.canEditDocument(this.index, this.collection);
    },
    canDelete() {
      if (!this.index || !this.collection) {
        return false;
      }
      return this.canDeleteDocument(this.index, this.collection);
    },
    circleShapes() {
      return this.shapesDocuments.filter((shape) => get(shape, 'content.type') === 'circle');
    },
    polygonShapes() {
      return this.shapesDocuments.filter((shape) => get(shape, 'content.type') === 'polygon');
    },
    multiPolygonShapes() {
      return this.shapesDocuments.filter((shape) => get(shape, 'content.type') === 'multipolygon');
    },
  },
  watch: {
    selectedGeopoint: {
      handler(value) {
        if (value) {
          this.map.fitBounds(this.coordinates, { maxZoom: 12 });
        }
      },
    },
    selectedGeoshape: {
      handler(value) {
        if (value) {
          this.map.fitBounds(this.coordinates, { maxZoom: 12 });
        }
      },
    },
  },
  methods: {
    /*
     * `@vue-leaflet/vue-leaflet` crée son objet Leaflet de façon asynchrone et
     * le signale par `ready` — il n'existe pas au `mounted` du parent, ni au
     * `$nextTick` qui suffisait à `vue2-leaflet`. C'est l'événement qui donne
     * la carte, pas le cycle de vie (ADR-0027).
     */
    onMapReady(map) {
      this.map = map;

      if (L.latLngBounds(this.coordinates).isValid()) {
        this.map.fitBounds(this.coordinates, { maxZoom: 12 });
      }
    },
    shapeClassName(shape) {
      return `data-cy-shape data-cy-shape-${shape._id} ${this.getShapeCyClasse(shape)}`.trim();
    },
    getShapeCyClasse(shape) {
      return this.currentDocument && this.currentDocument._id === shape._id
        ? 'data-cy-shape-selected'
        : '';
    },
    getShapeColor(id) {
      return this.currentDocument && this.currentDocument._id === id ? '#26AD23' : '#2981CA';
    },
    getRadiusInMeter(radius) {
      if (typeof radius === 'number') {
        return radius;
      }
      if (typeof radius !== 'string') {
        return null;
      }
      const value = parseInt(radius);
      const unit = radius.replace(value.toString(), '');
      let multiplicator;
      switch (unit) {
        case 'km':
          multiplicator = 1000;
          break;
        default:
          multiplicator = 1;
      }
      return value * multiplicator;
    },
    flattenShapes(arr) {
      return arr.reduce((a, b) => {
        return a.concat(Array.isArray(b) && typeof b[0] !== 'number' ? this.flattenShapes(b) : [b]);
      }, []);
    },
    getShapesCoordinates() {
      const circlePoints = this.circleShapes.map((circle) => circle.content.coordinates);

      const polygonArrays = this.polygonShapes.map((polygon) => polygon.content.coordinates);

      const multipolygonArrays = [
        ...this.multiPolygonShapes.map((multipolygon) => multipolygon.content.coordinates),
      ];

      const points = [
        ...circlePoints,
        ...this.flattenShapes(polygonArrays),
        ...this.flattenShapes(multipolygonArrays),
      ];
      return points;
    },
    onItemClicked(document, latlng, type, radius) {
      if (this.currentDocument === document) {
        this.currentDocument = null;
        return;
      }
      this.currentDocument = document;
      if (type === 'array') {
        this.map.fitBounds(latlng, { maxZoom: 14 });
      } else if (type === 'point') {
        this.map.setView(latlng, 14);
      } else if (type === 'circle') {
        const radiusInMeter = this.getRadiusInMeter(radius);
        const bounds = L.latLng(latlng).toBounds(radiusInMeter * 2);
        this.map.fitBounds(bounds, 14);
      }
    },
    closeDocument() {
      this.currentDocument = null;
    },
    getIcon(document) {
      if (get(this.currentDocument, '_id') === document._id) {
        return new this.LeafSelectedIcon({
          className: `mapView-marker-selected documentId-${document._id}`,
        });
      }

      return new this.LeafDefaultIcon({
        className: `mapView-marker-default documentId-${document._id}`,
      });
    },
    deleteCurrentDocument() {
      if (this.canDelete) {
        this.$emit('delete', this.currentDocument._id);
      }
    },
    editCurrentDocument() {
      if (this.canEdit) {
        this.$emit('edit', this.currentDocument._id);
      }
    },
  },
};
</script>
