<template>
  <div class="ViewMap">
    <div class="row">
      <div :class="getMapClass()">
        <l-map
          ref="map"
          @click="onMapClick"
        >
          <l-tile-layer
            :url="url"
            :attribution="attribution"
          />
          <l-marker
            v-for="document in documents"
            :key="document.id"
            :lat-lng="getCoordinates(document)"
            :icon="getIcon(document)"
            @click="onMarkerClick(document)"
          />
        </l-map>
      </div>

      <div
        v-if="currentDocument"
        class="col s2 viewMap-document-info"
      >
        <div class="row">
          <div class="col s9">
            {{ currentDocument.id }}
          </div>
          <a
            href=""
            :title="canEdit ? 'Edit Document' : 'You are not allowed to edit this document'"
            :class="{unauthorized: !canEdit}"
            @click.prevent="editCurrentDocument"
          >
            <i
              class="fa fa-pencil-alt pointer"
              :class="{'disabled': !canEdit}"
            />
          </a>

          <dropdown
            :id="currentDocument.id"
            myclass="icon-black"
          >
            <li>
              <a
                v-title="{active: !canDelete, title: 'You are not allowed to delete this document'}"
                :class="{'disabled': !canDelete}"
                @click="deleteCurrentDocument()"
              >
                Delete
              </a>
            </li>
          </dropdown>
        </div>
        <hr>
        <p
          v-json-formatter="{
            content: {
              id: currentDocument.id,
              body: currentDocument.content
            },
            open: true
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
import L from 'leaflet'
import Dropdown from '../../Materialize/Dropdown'
import '../../../../src/assets/leaflet.css'
import JsonFormatter from '../../../directives/json-formatter.directive'
import title from '../../../directives/title.directive'
import {
  canEditDocument,
  canDeleteDocument
} from '../../../services/userAuthorization'

export default {
  name: 'ViewMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    Dropdown
  },
  directives: {
    JsonFormatter,
    title
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
        iconUrl: 'static/images/marker-icon-2x-blue.png',
        shadowUrl: 'static/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      selectedIcon: new L.Icon({
        iconUrl: 'static/images/marker-icon-2x-green.png',
        shadowUrl: 'static/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }
  },
  computed: {
    coordinates() {
      return this.documents.map(this.getCoordinates)
    },
    canEdit() {
      if (!this.index || !this.collection) {
        return false
      }
      return canEditDocument(this.index, this.collection)
    },
    canDelete() {
      if (!this.index || !this.collection) {
        return false
      }
      return canDeleteDocument(this.index, this.collection)
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
    getMapClass() {
      const classes = {
        col: true,
        'viewMap-document-map': true,
        s12: this.currentDocument === null,
        s10: this.currentDocument !== null
      }

      return classes
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
    height: 500px;
  }

  .viewMap-document-info {
    overflow-x: scroll;
  }

}
</style>
