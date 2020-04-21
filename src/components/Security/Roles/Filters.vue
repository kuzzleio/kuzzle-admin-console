<template>
  <b-card no-body data-cy="RolesFilters" class="RolesFilters">
    <template v-slot:header>
      <b-row>
        <b-col cols="9">
          <div class="RolesFilters-searchBar">
            <i class="RolesFilters-searchIcon fa fa-search" />
            <b-form-tags
              v-model="controllers"
              placeholder="Search by controller..."
            />
          </div>
        </b-col>

        <b-col class="text-right">
          <b-button
            class="mr-2"
            data-cy="RolesFilters-resetBtn"
            variant="outline-primary"
            @click="resetSearch"
          >
            Reset
          </b-button>
          <b-button
            data-cy="RolesFilters-submitBtn"
            variant="primary"
            @click="submitSearch"
          >
            Search
          </b-button>
        </b-col>
      </b-row>
    </template>
  </b-card>
</template>

<script>
export default {
  name: 'RolesFilters',
  components: {},
  props: {
    currentFilter: Object
  },
  data() {
    return {
      controllers: []
    }
  },
  watch: {
    currentFilter: {
      immediate: true,
      handler(value) {
        this.controllers = value && value.controllers ? value.controllers : []
      }
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
