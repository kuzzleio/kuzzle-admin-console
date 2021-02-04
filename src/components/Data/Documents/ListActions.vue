<template>
  <b-row no-gutters>
    <b-col cols="8" class="mt-2">
      <b-button
        variant="outline-dark"
        class="ml-0 mr-2"
        :disabled="!displayToggleAll"
        @click="$emit('toggle-all')"
      >
        <i
          :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'} left`"
        />
        Toggle all
      </b-button>

      <b-button
        variant="outline-danger"
        class="m-2"
        :disabled="!displayBulkDelete"
        @click="$emit('bulk-delete')"
      >
        <i class="fa fa-minus-circle left" />
        Delete
      </b-button>

      <b-button
        variant="outline-secondary"
        class="m-2"
        @click.prevent="$emit('refresh')"
      >
        <i class="fas fa-sync-alt left" />
        Refresh
      </b-button>
    </b-col>
    <template v-if="displayGeopointSelect">
      <b-col cols="2">
        Selected geopoint
      </b-col>
      <b-col cols="2">
        <m-select
          v-model="selectedGeopoint"
          @input="
            selectedGeopoint => $emit('select-geopoint', selectedGeopoint)
          "
        >
          <option
            v-for="geopoint in geopointList"
            :key="geopoint"
            :value="geopoint"
          >
            {{ geopoint }}
          </option>
        </m-select>
      </b-col>
    </template>
  </b-row>
</template>

<script>
import MSelect from '../../Common/MSelect'

export default {
  name: 'ListActions',
  components: {
    MSelect
  },
  props: {
    allChecked: Boolean,
    displayBulkDelete: Boolean,
    displayGeopointSelect: Boolean,
    displayToggleAll: Boolean,
    geopointList: Array
  },
  data() {
    return {
      selectedGeopoint: null
    }
  }
}
</script>

<style lang="scss"></style>
