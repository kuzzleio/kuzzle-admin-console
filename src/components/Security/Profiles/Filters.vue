<template>
  <b-card no-body data-cy="ProfileFilters">
    <template #header>
      <b-row>
        <b-col cols="9" class="vertical-align">
          Search by role
          <b-dropdown
            class="ml-2"
            data-cy="ProfileFilters-roleSelect"
            variant="outline-primary"
            menu-class="dropdownScroll"
            text="Select roles to be contained in the profiles"
            no-flip
          >
            <b-dropdown-text
              v-for="role of roleList"
              :key="`dropdown-${role}`"
              class="dropdown-text inlineDisplay pointer p-0"
              :data-cy="`RoleSelect--${role}`"
            >
              <span class="inlineDisplay-item">
                <b-form-checkbox
                  :id="role"
                  class="mx-2"
                  :checked="roleIsSelected(role)"
                  @change="toggleRole(role, $event)"
                />
              </span>
              <label class="inlineDisplay-item code pointer" :for="role" :title="role">{{
                role
              }}</label>
            </b-dropdown-text>
            <b-dropdown-item v-if="roleList.length === 0">
              <span class="inlineDisplay-item"> No roles found. </span>
            </b-dropdown-item>
          </b-dropdown>
          <b-badge
            v-if="hasFilter"
            data-cy="ProfileFilters-filterAppliedPill"
            pill
            variant="info"
            class="ml-2 py-2 px-3"
            >Filters are being applied</b-badge
          >
        </b-col>
        <b-col class="text-right">
          <b-button
            class="mr-2"
            data-cy="ProfileFilters-resetBtn"
            variant="outline-primary"
            @click="reset"
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
import { truncateName } from '@/utils';

export default {
  name: 'Filters',
  components: {},
  props: {
    labelSearchButton: {
      type: String,
      required: false,
      default: 'search',
    },
    currentFilter: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      roleList: [],
      selectedRoles: [],
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
    hasFilter() {
      return this.selectedRoles.length > 0;
    },
  },
  watch: {
    selectedRoles() {
      this.$emit('filters-updated', this.selectedRoles);
    },
  },
  mounted() {
    this.fetchRoleList();
    this.selectedRoles = this.currentFilter.map((role) => role);
  },
  methods: {
    truncateName,
    async fetchRoleList() {
      const res = await this.wrapper.performSearchRoles();
      this.roleList = res.documents.map((role) => role._id);
    },
    roleIsSelected(role) {
      return this.selectedRoles.includes(role);
    },
    toggleRole(role, value) {
      if (!value) {
        this.selectedRoles.splice(this.selectedRoles.indexOf(role), 1);
      } else {
        this.selectedRoles.push(role);
      }
    },
    reset() {
      this.selectedRoles = [];
      this.$emit('reset');
    },
  },
};
</script>

<style lang="scss" scoped>
.Filters-actions {
  height: 48px;
  line-height: 48px;
}
.inlineDisplay {
  display: table;

  &-item {
    display: table-cell;
  }
}

::v-deep .dropdownScroll {
  max-height: 250px;
  overflow-y: scroll;
}

.dropdown-text {
  display: block;
  width: 100%;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
}
</style>
