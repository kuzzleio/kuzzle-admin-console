<template>
  <div>
    <div class="json-form">
      <!-- For nested objects -->
      <fieldset>
        <legend>
          {{ name }}
        </legend>

        <div class="input-field">
          <input
            id="lat"
            v-model="value.lat"
            type="number"
            step="0.0000001"
            @input="updateLocation"
          />
          <label for="lat" :class="{ active: value.lat !== null }"
            >latitude</label
          >
        </div>
        <div class="input-field">
          <input
            id="lng"
            v-model="value.lon"
            type="number"
            step="0.0000001"
            @input="updateLocation"
          />
          <label for="lng" :class="{ active: value.lon !== null }"
            >longitude</label
          >
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonFormItemGeopoint',
  props: {
    content: Object,
    name: String,
    type: String,
    parent: String
  },
  data() {
    return {
      value: {
        lat: null,
        lon: null
      }
    }
  },
  watch: {
    content: 'initValue'
  },
  mounted() {
    this.initValue()
  },
  methods: {
    updateLocation() {
      this.$emit('update-value', { name: this.name, value: this.value })
    },
    initValue() {
      if (!this.content) {
        return
      }

      if (this.parent && this.content[this.parent]) {
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
  }
}
</script>
