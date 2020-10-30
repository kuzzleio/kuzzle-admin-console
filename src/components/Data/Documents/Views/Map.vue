<template>
  <div class="ViewMap">
    <b-row class="align-self-stretch">
      <b-col cols="8" class="viewMap-document-map">
        <l-map ref="map" @click="onMapClick">
          <l-tile-layer :url="url" :attribution="attribution" />
          <l-marker
            v-for="document in documents"
            :key="document.id"
            :lat-lng="getCoordinates(document)"
            :icon="getIcon(document)"
            @click="onMarkerClick(document)"
          />
        </l-map>
      </b-col>
      <b-col cols="4">
        <b-card no-body v-if="currentDocument">
          <b-card-header>
            <b-row align-v="center">
              <b-col cols="9" align-v="center">
                {{ currentDocument.id }}
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
    documents: {
      type: Array,
      required: true
    },
    getCoordinates: {
      type: Function,
      required: true
    },
    index: String,
    collection: String
  },
  data() {
    return {
      latField: null,
      lngField: null,
      map: null,
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentDocument: null,
      defaultIcon: new L.Icon({
        iconUrl: '/images/marker-icon-2x-blue.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      selectedIcon: new L.Icon({
        iconUrl: '/images/marker-icon-2x-green.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }
  },
  computed: {
    ...mapGetters('auth', ['canEditDocument', 'canDeleteDocument']),
    coordinates() {
      return this.documents.map(this.getCoordinates)
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
  watch: {},
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject
      this.map.fitBounds(this.coordinates)
    })
  },
  updated() {},
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
        return this.selectedIcon
      }

      return this.defaultIcon
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
    overflow-y: scroll;
  }
}
</style>
