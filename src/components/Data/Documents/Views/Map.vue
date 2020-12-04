<template>
  <div class="ViewMap">
    <b-row class="pb-2">
      <b-col cols="6" class="text-left">
        GeoPoint field
        <b-form-select
          class="mx-2"
          style="width: unset"
          :options="mappingGeopoints"
          :value="selectedGeopoint"
          @change="$emit('on-select-geopoint', $event)"
        >
        </b-form-select>
      </b-col>
      <b-col cols="6" class="text-right">
        Show
        <b-form-select
          class="mx-2"
          style="width: unset"
          :options="itemsPerPage"
          :value="currentPageSize"
          @change="$emit('change-page-size', $event)"
        >
        </b-form-select>
        <span v-if="totalDocuments">
          of {{ totalDocuments }} total items.
        </span>
      </b-col>
    </b-row>
    <b-row class="align-self-stretch">
      <b-col cols="8" class="viewMap-document-map">
        <l-map ref="map" @click="onMapClick" data-cy="mapView-map">
          <l-tile-layer :url="url" :attribution="attribution" />
          <l-marker
            v-for="document in geoDocuments"
            :key="document.source.id"
            :lat-lng="document.coordinates"
            :icon="getIcon(document.source)"
            @click="onMarkerClick(document.source)"
          />
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
                  currentDocument.id
                }}</span>
              </b-col>
              <b-col cols="3">
                <b-button
                  class="DocumentMapItem-update"
                  href=""
                  variant="link"
                  :data-cy="`DocumentMapItem-update--${currentDocument.id}`"
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
                  :data-cy="`DocumentListItem-delete--${currentDocument.id}`"
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
                    You can view a document content by click on a marker
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
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
import L from 'leaflet'
import '@/assets/leaflet.css'
import JsonFormatter from '@/directives/json-formatter.directive'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'ViewMap',
  components: {
    LMap,
    LTileLayer,
    LMarker
  },
  directives: {
    JsonFormatter
  },
  props: {
    currentPageSize: {
      type: Number,
      default: 10
    },
    selectedGeopoint: {
      type: String,
      required: true
    },
    mappingGeopoints: {
      type: Array,
      required: true
    },
    geoDocuments: {
      type: Array,
      required: true
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
    formattedDocument() {
      if (!this.currentDocument) {
        return {}
      }
      const document = _.omit(this.currentDocument, ['id', '_kuzzle_info'])
      document._kuzzle_info = this.currentDocument._kuzzle_info
      return document
    }
  },
  watch: {
    selectedGeopoint: {
      handler() {
        this.map.fitBounds(this.coordinates)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject
      this.map.fitBounds(this.coordinates)
    })
  },
  methods: {
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
          className: `mapView-marker-selected documentId-${document.id}`
        })
      }

      return new this.LeafDefaultIcon({
        className: `mapView-marker-default documentId-${document.id}`
      })
    },
    deleteCurrentDocument() {
      if (this.canDelete) {
        this.$emit('delete', this.currentDocument.id)
      }
    },
    editCurrentDocument() {
      if (this.canEdit) {
        this.$emit('edit', this.currentDocument.id)
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
