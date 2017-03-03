<template>
  <fieldset>
    <legend>
      {{name}}
    </legend>
    <div class="row input-field">
      <input :id="fullName" type="number" v-model="lat" step="0.000001"/>
      <label :for="fullName" :class="{'active': value}">lat</label>
    </div>

    <div class="row input-field">
      <input :id="fullName" type="number" v-model="lon" step="0.000001"/>
      <label :for="fullName" :class="{'active': value}">lon</label>
    </div>
  </fieldset>
</template>

<script>
  import {SET_PARTIAL_TO_DOCUMENT} from '../../../vuex/modules/data/mutation-types'

  export default {
    name: 'JsonFormItemGeoPoint',
    props: {
      content: Object,
      name: String,
      type: String,
      fullName: String
    },
    data () {
      return {
        lat: null,
        lon: null
      }
    },
    watch: {
      lat () {
        this.$store.commit(SET_PARTIAL_TO_DOCUMENT, {path: this.fullName, value: {lat: this.lat, lon: this.lon}})
      },
      lon () {
        this.$store.commit(SET_PARTIAL_TO_DOCUMENT, {path: this.fullName, value: {lat: this.lat, lon: this.lon}})
      },
      content (v) {
        this.lat = this.content.lat
        this.lon = this.content.lon
      }
    }
  }
</script>
