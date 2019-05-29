<template>
  <div class="ListActions row actions">
    <div class="col s8">
      <button
        class="btn btn-small waves-effect waves-light tertiary"
        :disabled="!displayToggleAll"
        :class="{disabled: !displayToggleAll}"
        @click="$emit('toggle-all')"
      >
        <i
          class="fa left"
          :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'"
        />
        Toggle all
      </button>

      <button
        class="btn btn-small waves-effect waves-light margin-right-5 primary"
        :disabled="!displayCreate"
        :class="{disabled: !displayCreate}"
        @click.prevent="$emit('create')"
      >
        <i class="fa fa-plus-circle left" />
        Create
      </button>

      <button
        class="btn btn-small waves-effect waves-light red-color"
        :disabled="!displayBulkDelete"
        :class="{disabled: !displayBulkDelete}"
        @click="$emit('bulk-delete')"
      >
        <i class="fa fa-minus-circle left" />
        Delete
      </button>

      <button
        class="btn btn-small waves-effect waves-light margin-right-5"
        @click.prevent="$emit('refresh')"
      >
        <i class="fas fa-sync-alt left" />
        Refresh
      </button>
    </div>
    <div v-if="displayGeopointSelect">
      <div class="col s2">
        Selected geopoint
      </div>
      <div class="col s2">
        <m-select
          v-model="selectedGeopoint"
          @input="(selectedGeopoint) => $emit('select-geopoint', selectedGeopoint)"
        >
          <option
            v-for="geopoint in geopointList"
            :key="geopoint"
            :value="geopoint"
          >
            {{ geopoint }}
          </option>
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
