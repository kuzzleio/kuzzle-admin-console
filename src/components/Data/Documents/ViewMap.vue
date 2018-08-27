<template>
  <div class="ViewMap">
    <l-map ref="map">
      <l-tile-layer :url="url" :attribution="attribution"/>
      <l-marker
        v-for="document in documents"
        :key="document.id"
        v-bind:lat-lng="getCoordinates(document)"
        >
        <l-popup :content="document.id"/>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet'

export default {
  name: 'ViewMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup
  },
  props: {
    documents: {
      type: Array,
      required: true
    },
    getCoordinates: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      latField: null,
      lngField: null,
      map: null,
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  computed: {
    latLngs() {
      return this.documents.map(this.getCoordinates)
    }
  },
  methods: {},
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject

      this.map.fitBounds(this.latLngs)
    })
  },
  watch: {},
  updated() {
    this.map.fitBounds(this.latLngs)
  }
}
</script>

<style scoped lang="scss">
.ViewMap {
}

.select-wrapper span.caret {
  top: 10px;
}
</style>
