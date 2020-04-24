<template>
  <b-card no-body data-cy="RolesFilters" class="RolesFilters">
    <template v-slot:header>
      <b-row>
        <b-col cols="10">
          <div class="RolesFilters-searchBar">
            <i class="RolesFilters-searchIcon fa fa-search" />
            <b-form-tags
              v-model="controllers"
              data-cy="RoleFilters-searchBar"
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
  methods: {
    resetSearch() {
      this.controllers = []
    }
  },
  mounted() {
    this.controllers =
      this.currentFilter && this.currentFilter.controllers
        ? this.currentFilter.controllers
        : []
  },
  watch: {
    controllers: {
      handler(value) {
        this.$emit('filters-updated', { controllers: value })
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
}
</style>
