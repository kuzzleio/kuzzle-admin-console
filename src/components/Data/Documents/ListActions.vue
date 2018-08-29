<template>
  <div class="ListActions row actions">
    <div class="col s8">
      <button
        class="btn btn-small waves-effect waves-light tertiary"
        :disabled="!displayToggleAll"
        :class="!displayToggleAll ? 'disabled' : ''"
        @click="$emit('toggle-all')">
        <i class="fa left"
          :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'"
        ></i>
        Toggle all
      </button>

      <button class="btn btn-small waves-effect waves-light margin-right-5 primary"
        @click.prevent="$emit('create')"
        :disabled="!displayCreate"
        :class="!displayCreate ? 'disabled' : ''"
        :title="displayCreate ? '' : 'You are not allowed to create a document in this collection'"
      >
        <i class="fa fa-plus-circle left"></i>
        Create
      </button>

      <button class="btn btn-small waves-effect waves-light"
        :class="displayBulkDelete ? 'red-color' : 'disabled'"
        :disabled="!displayBulkDelete"
        @click="$emit('bulk-delete')"
        :title="displayBulkDelete ? '' : 'You need to select at least one element'">
        <i class="fa fa-minus-circle left"></i>
        Delete
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
