<template>
  <b-card no-body data-cy="RolesFilters" class="RolesFilters">
    <template v-slot:header>
      <b-row>
        <b-col cols="8">
          <div class="RolesFilters-searchBar">
            <i class="RolesFilters-searchIcon fa fa-search" />
            <b-form-tags
              v-model="controllers"
              data-cy="RoleFilters-searchBar"
              placeholder="Search by controller..."
            />
          </div>
        </b-col>
        <b-col cols="2" v-if="availableControllers.length !== 0">
          <b-dropdown text="Controllers">
            <b-dropdown-item
              v-for="controller of availableControllers"
              :key="`dropdownControllers-${controller}`"
              :disabled="controllers.includes(controller)"
              @click="addControllerTag(controller)"
            >
              {{ controller }}
            </b-dropdown-item>
          </b-dropdown>
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
import { mapGetters } from 'vuex'

export default {
  name: 'RolesFilters',
  components: {},
  props: {
    currentFilter: Object
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle'])
  },
  data() {
    return {
      controllers: [],
      availableControllers: []
    }
  },
  methods: {
    resetSearch() {
      this.controllers = []
    },
    addControllerTag(controller) {
      if (this.controllers.includes(controller)) {
        return
      }
      this.controllers.push(controller)
    },
    async getKuzzlePublicApi() {
      try {
        const publicApi = await this.$kuzzle.query({
          controller: 'server',
          action: 'publicApi'
        });
        this.availableControllers = Object.keys(publicApi.result)
      } catch (error) {
        this.$log.error(error)
      }
    }
  },
  mounted() {
    this.controllers =
      this.currentFilter && this.currentFilter.controllers
        ? this.currentFilter.controllers
        : []
    this.getKuzzlePublicApi()
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
