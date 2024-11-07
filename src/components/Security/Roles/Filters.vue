<template>
  <b-card no-body data-cy="RolesFilters" class="RolesFilters">
    <template #header>
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
        <b-col v-if="availableControllers.length !== 0" cols="2">
          <b-dropdown id="controllers-dropdown" text="Controllers" :disabled="disableDropdown">
            <b-dropdown-item
              v-for="controller of availableControllers"
              :key="`dropdownControllers-${controller}`"
              :disabled="controllers.includes(controller)"
              @click="addControllerTag(controller)"
            >
              {{ controller }}
            </b-dropdown-item>
          </b-dropdown>
          <b-tooltip v-if="disableDropdown" target="controllers-dropdown" triggers="hover">
            Unable to retrieve controller list
          </b-tooltip>
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
import { mapState } from 'pinia';

import { useKuzzleStore } from '@/stores';

export default {
  name: 'RolesFilters',
  components: {},
  props: {
    currentFilter: Object,
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
  },
  data() {
    return {
      controllers: [],
      availableControllers: [],
      disableDropdown: false,
    };
  },
  watch: {
    controllers: {
      handler(value) {
        this.$emit('filters-updated', { controllers: value });
      },
    },
  },
  mounted() {
    this.controllers =
      this.currentFilter && this.currentFilter.controllers ? this.currentFilter.controllers : [];
    this.getKuzzlePublicApi();
  },
  methods: {
    resetSearch() {
      this.controllers = [];
    },
    addControllerTag(controller) {
      if (this.controllers.includes(controller)) {
        return;
      }
      this.controllers.push(controller);
    },
    async getKuzzlePublicApi() {
      try {
        const publicApi = await this.$kuzzle.query({
          controller: 'server',
          action: 'publicApi',
        });
        this.availableControllers = Object.keys(publicApi.result);
      } catch (error) {
        this.disableDropdown = true;
        this.$log.error(error);
      }
    },
  },
};
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
