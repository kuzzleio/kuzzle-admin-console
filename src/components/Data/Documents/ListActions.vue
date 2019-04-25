<template>
  <div class="ListActions row actions">
    <div class="col s8">
      <button
        class="btn btn-small waves-effect waves-light tertiary"
        v-if="displayToggleAll"
        @click="$emit('toggle-all')">
        <i class="fa left"
          :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'"
        ></i>
        Toggle all
      </button>

      <button class="btn btn-small waves-effect waves-light margin-right-5 primary"
        v-if="displayCreate"
        @click.prevent="$emit('create')"
      >
        <i class="fa fa-plus-circle left"></i>
        Create
      </button>

      <button class="btn btn-small waves-effect waves-light red-color"
        v-if="displayBulkDelete"
        @click="$emit('bulk-delete')"
      >
        <i class="fa fa-minus-circle left"></i>
        Delete
      </button>

      <button class="btn btn-small waves-effect waves-light margin-right-5"
        @click.prevent="$emit('refresh')"
      >
        <i class="fas fa-sync-alt left"></i>
        Refresh
      </button>
    </div>
    <div v-if="displayGeopointSelect">
      <div class="col s2">
        Selected geopoint
      </div>
      <div class="col s2">
        <m-select v-model="selectedGeopoint" @input="(selectedGeopoint) => $emit('select-geopoint', selectedGeopoint)">
          <option v-for="geopoint in geopointList" :value="geopoint" v-bind:key="geopoint">{{ geopoint }}</option>
        </m-select>
      </div>
    </div>
  </div>
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
    displayCreate: Boolean,
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

<style lang="scss">
.ListActions {
  .select-wrapper {
    input {
      line-height: 1.5rem;
      height: 1.5rem;
    }
  }
}
</style>
