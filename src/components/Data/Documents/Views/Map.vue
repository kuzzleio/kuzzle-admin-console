<template>
  <div class="ViewMap">
    <b-row class="pb-2">
      <b-col cols="6" class="text-left">
        <div v-if="mappingGeopoints.length">
          GeoPoint field
          <b-form-select
            class="mx-2"
            style="width: unset"
            :options="mappingGeopoints"
            :value="selectedGeopoint || ''"
            @change="$emit('on-select-geopoint', $event)"
          >
          </b-form-select>
        </div>
        <div v-if="mappingGeoshapes.length">
          GeoShape field
          <b-form-select
            class="mx-2"
            style="width: unset"
            :options="mappingGeoshapes"
            :value="selectedGeoshape || ''"
            @change="$emit('on-select-geoshape', $event)"
          >
          </b-form-select>
        </div>
      </b-col>
      <b-col cols="6" class="text-right">
        <PerPageSelector
          :current-page-size="currentPageSize"
          :total-documents="totalDocuments"
          @change-page-size="$emit('change-page-size', $event)"
        />
      </b-col>
    </b-row>
    <b-row class="align-self-stretch">
      <b-col cols="8" class="viewMap-document-map">
        <l-map ref="map" @click="onMapClick" data-cy="mapView-map">
          <l-tile-layer :url="url" :attribution="attribution" />
          <l-marker
            v-for="document in geoDocuments"
            :key="document.source._id"
            :lat-lng="document.coordinates"
            :icon="getIcon(document.source)"
            @click="onMarkerClick(document.source)"
          />
          <l-circle
            v-for="shape of circleShapes"
            :key="shape._id"
            :lat-lng="shape.content.coordinates"
            :radius="parseInt(shape.content.radius)"
          />
          <l-polygon
            v-for="shape of polygonShapes"
            :key="shape._id"
            :lat-lngs="shape.content.coordinates"
          />
          <div v-for="shape of multiPolygonShapes" :key="shape._id">
            <l-polygon
              v-for="(polygon, index) in shape.content.coordinates"
              :key="`${shape._id}-${index}`"
              :lat-lngs="polygon"
            />
          </div>
        </l-map>
      </b-col>
      <b-col cols="4">
        <b-card
          no-body
          v-if="currentDocument"
          data-cy="mapView-current-document-card"
        >
          <b-card-header>
            <b-row align-v="center">
              <b-col cols="9" align-v="center">
                <span data-cy="mapView-current-document-id">{{
                  currentDocument._id
                }}</span>
              </b-col>
              <b-col cols="3">
                <b-button
                  class="DocumentMapItem-update"
                  href=""
                  variant="link"
                  :data-cy="`DocumentMapItem-update--${currentDocument._id}`"
                  :disabled="!canEdit"
                  :title="
                    canEdit
                      ? 'Edit Document'
                      : 'You are not allowed to edit this Document'
                  "
                  @click.prevent="editCurrentDocument"
                >
                  <i class="fa fa-pencil-alt" :class="{ disabled: !canEdit }" />
                </b-button>

                <b-button
                  class="DocumentListItem-delete"
                  href=""
                  variant="link"
                  :data-cy="`DocumentListItem-delete--${currentDocument._id}`"
                  :disabled="!canDelete"
                  :title="
                    canDelete
                      ? 'Delete Document'
                      : 'You are not allowed to delete this Document'
                  "
                  @click.prevent="deleteCurrentDocument"
                >
                  <i class="fa fa-trash" :class="{ disabled: !canEdit }" />
                </b-button>
              </b-col>
            </b-row>
          </b-card-header>
          <b-card-body class="pt-1 pb-1">
            <b-row class="viewMap-document-json">
              <pre
                class="json-formatter"
                v-json-formatter="{ content: formattedDocument, open: true }"
              />
            </b-row>
          </b-card-body>
        </b-card>
        <b-card
          v-else
          class="light-shadow viewMap-document-map"
          data-cy="mapView-no-document-card"
          bg-variant="light"
        >
          <b-card-text class="p-0">
            <b-row align-h="center" class="valign-center empty-set h-100">
              <b-col cols="2" class="text-center">
                <i
                  class="fa fa-3x fa-search text-secondary mt-3"
                  aria-hidden="true"
                />
              </b-col>
              <b-col md="10">
                <h3 class="text-secondary font-weight-bold">
                  No document selected.
                </h3>
                <p>
                  <em>
                    You can view a document content by clicking on a marker
                  </em>
                </p>
              </b-col>
            </b-row>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LCircle, LPolygon } from 'vue2-leaflet'
import L from 'leaflet'
import '@/assets/leaflet.css'
import JsonFormatter from '@/directives/json-formatter.directive'
import { mapGetters } from 'vuex'
import _ from 'lodash'
import PerPageSelector from '@/components/Common/PerPageSelector'

export default {
  name: 'ViewMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    PerPageSelector,
    LCircle,
    LPolygon
  },
  directives: {
    JsonFormatter
  },
  props: {
    currentPageSize: {
      type: Number,
      default: 25
    },
    selectedGeopoint: {
      type: String,
      required: true
    },
    selectedGeoshape: {
      type: String,
      required: true
    },
    mappingGeopoints: {
      type: Array,
      required: true
    },
    mappingGeoshapes: {
      type: Array,
      required: true
    },
    geoDocuments: {
      type: Array,
      required: true
    },
    shapesDocuments: {
      type: Array,
      require: true
    },
    index: String,
    collection: String
  },
  data() {
    return {
      itemsPerPage: [10, 25, 50, 100, 500],
      latField: null,
      lngField: null,
      map: null,
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentDocument: null,
      LeafDefaultIcon: L.Icon.extend({
        options: {
          iconUrl: '/images/marker-icon-2x-blue.png',
          shadowUrl: '/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        }
      }),
      defaultIcon: new L.Icon({
        iconUrl: '/images/marker-icon-2x-blue.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'mapView-marker-default'
      }),
      LeafSelectedIcon: L.Icon.extend({
        options: {
          iconUrl: '/images/marker-icon-2x-green.png',
          shadowUrl: '/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        }
      }),
      selectedIcon: new L.Icon({
        iconUrl: '/images/marker-icon-2x-green.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'mapView-marker-selected'
      })
    }
  },
  computed: {
    totalDocuments() {
      return this.geoDocuments.length
    },
    ...mapGetters('auth', ['canEditDocument', 'canDeleteDocument']),
    coordinates() {
      return this.geoDocuments.map(d => d.coordinates)
    },
    canEdit() {
      if (!this.index || !this.collection) {
        return false
      }
      return this.canEditDocument(this.index, this.collection)
    },
    canDelete() {
      if (!this.index || !this.collection) {
        return false
      }
      return this.canDeleteDocument(this.index, this.collection)
    },
    formattedShapes() {
      if (!this.currentDocument) {
        return {}
      }
      const document = _.omit(this.currentDocument, ['_id', '_kuzzle_info'])
      document._kuzzle_info = this.currentDocument._kuzzle_info
      return document
    },
    formattedDocument() {
      if (!this.currentDocument) {
        return {}
      }
      const document = _.omit(this.currentDocument, ['_id', '_kuzzle_info'])
      document._kuzzle_info = this.currentDocument._kuzzle_info
      return document
    },
    circleShapes() {
      return this.shapesDocuments
        .filter(shape => shape[this.selectedGeoshape].type === 'circle')
        .map(shape => ({
          content: shape[this.selectedGeoshape],
          _id: shape._id
        }))
    },
    polygonShapes() {
      return this.shapesDocuments
        .filter(shape => shape[this.selectedGeoshape].type === 'polygon')
        .map(shape => ({
          content: shape[this.selectedGeoshape],
          _id: shape._id
        }))
    },
    multiPolygonShapes() {
      return this.shapesDocuments
        .filter(shape => shape[this.selectedGeoshape].type === 'multipolygon')
        .map(shape => ({
          content: shape[this.selectedGeoshape],
          _id: shape._id
        }))
    }
  },
  watch: {
    selectedGeopoint: {
      handler(value) {
        if (value) {
          this.map.fitBounds(this.coordinates)
        }
      }
    },
    selectedGeoshape: {
      handler(value) {
        if (value) {
          this.mapFitGeoShapes()
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject
      if (this.coordinates.length) {
        this.map.fitBounds(this.coordinates)
      }
    })
  },
  methods: {
    mapFitGeoShapes() {
      this.$log.debug('MAP FIT GEO SHAPES')
      // todo get shapes bounds and do map.fitbounds
    },
    onMarkerClick(document) {
      if (this.currentDocument === document) {
        this.currentDocument = null
      } else {
        this.currentDocument = document
      }
    },
    onMapClick() {
      this.currentDocument = null
    },
    getIcon(document) {
      if (this.currentDocument === document) {
        return new this.LeafSelectedIcon({
          className: `mapView-marker-selected documentId-${document._id}`
        })
      }

      return new this.LeafDefaultIcon({
        className: `mapView-marker-default documentId-${document._id}`
      })
    },
    deleteCurrentDocument() {
      if (this.canDelete) {
        this.$emit('delete', this.currentDocument._id)
      }
    },
    editCurrentDocument() {
      if (this.canEdit) {
        this.$emit('edit', this.currentDocument._id)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.ViewMap {
  .viewMap-document-map {
    height: 600px;
  }
  .viewMap-document-json {
    height: 525px;
  }
  .json-formatter {
    max-height: 525px;
    overflow-y: auto;
  }
}
</style>
