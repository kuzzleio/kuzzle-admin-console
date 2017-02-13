<template>
  <div>
    <div class="json-form">
      <!-- For nested objects -->
      <fieldset>
        <legend>
          {{name}}
        </legend>

        <div class="input-field">
          <input id="lat" type="number" v-model="value.lat" @input="updateLocation" step="0.0000001"/>
          <label for="lat" :class="{'active': value.lat !== null}">latitude</label>
        </div>
        <div class="input-field">
          <input id="lng" type="number" v-model="value.lon" @input="updateLocation" step="0.0000001"/>
          <label for="lng" :class="{'active': value.lon !== null}">longitude</label>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script>
  import JsonEditor from '../../Common/JsonEditor'

  export default {
    name: 'JsonFormItemGeopoint',
    components: {
      JsonEditor
    },
    props: {
      content: Object,
      name: String,
      type: String,
      parent: String
    },
    data () {
      return {
        value: {
          lat: null,
          lon: null
        }
      }
    },
    methods: {
      updateLocation (v) {
        this.$emit('update-value', {name: this.name, value: this.value})
      },
      initValue () {
        if (this.parent) {
          if (this.content[this.parent][this.name]) {
            this.value.lat = this.content[this.parent][this.name].lat
            this.value.lon = this.content[this.parent][this.name].lon
          }
        } else {
          if (this.content[this.name]) {
            this.value.lat = this.content[this.name].lat
            this.value.lon = this.content[this.name].lon
          }
        }
      }
    },
    mounted () {
      this.initValue()
    },
    watch: {
      content: 'initValue'
    }
  }
</script>
