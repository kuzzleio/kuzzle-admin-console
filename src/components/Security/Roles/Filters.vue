<template>
  <div class="RolesFilters">
    <div class="card-panel card-header">
      <div class="row filters margin-bottom-0">
        <form @submit.prevent="submitSearch">
          <div class="col s7">
            <div class="RolesFilters-searchBar">
              <i class="RolesFilters-searchIcon fa fa-search"></i>
              <multiselect
                :options="[]"
                :taggable="true"
                tag-placeholder="Add filter on this controller"
                @tag="addController"
                @remove="removeController"
                :value="controllers"
                placeholder="Search by controller..."
                :multiple="true">
              </multiselect>
            </div>
          </div>
          <div class="col s3 RolesFilters-actions">
            <button type="submit" class="btn btn-small waves-effect waves-light">Search</button>
            <button class="btn-flat btn-small waves-effect waves-light" @click="resetSearch">reset</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import MSelect from '../../Common/MSelect'
import Multiselect from 'vue-multiselect'
import {} from 'vue-multiselect/dist/vue-multiselect.min.css'

export default {
  name: 'RolesFilters',
  props: {
    currentFilter: Object
  },
  components: {
    MSelect,
    Multiselect
  },
  data() {
    return {
      controllers: []
    }
  },
  methods: {
    submitSearch() {
      if (this.controllers.length === 0) {
        this.$emit('filters-updated', null)
        return
      }

      this.$emit('filters-updated', { controllers: this.controllers })
    },
    resetSearch() {
      this.controllers = []
      this.$emit('reset', null)
    },
    addController(value) {
      if (this.controllers.indexOf(value) !== -1) {
        return
      }

      this.controllers.push(value)
    },
    removeController(removedValue) {
      this.controllers = this.controllers.filter(
        value => value !== removedValue
      )
    }
  },
  watch: {
    currentFilter: {
      immediate: true,
      handler(value) {
        this.controllers = value && value.controllers ? value.controllers : []
      }
    }
  }
}
</script>


<style lang="scss">
.RolesFilters-searchBar {
  border: none;
  height: auto;
  display: flex;
  align-items: center;

  .RolesFilters-searchIcon {
    margin-right: 10px;
  }

  // vue-multiselect overrides
  .multiselect {
    flex-grow: 1;
  }
  .multiselect__tags {
    display: flex;
    align-items: center;
    background: none;
    padding: 0 0 0 0;
    border: none;

    .multiselect__tag {
      margin-top: 13px;
      background-color: $secondary-color;
    }
  }

  .multiselect__select {
    display: none;
  }

  ul.multiselect__content {
    z-index: 99;
    li.multiselect__element {
      z-index: 99;
    }
  }
}
.RolesFilters-actions {
  height: 48px;
  line-height: 48px;
}
</style>
