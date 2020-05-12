<template>
  <b-card no-body data-cy="ProfileFilters">
    <template v-slot:header>
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
            <b-dropdown-text v-for="role of roleList" :key="`dropdown-${role}`">
              <div
                class="inlineDisplay pointer"
                :data-cy="`RoleSelect--${role}`"
              >
                <span class="inlineDisplay-item">
                  <b-form-checkbox
                    class="mx-2"
                    :checked="roleIsSelected(role)"
                    :id="role"
                    @change="toggleRole(role, $event)"
                  />
                </span>
                <label
                  class="inlineDisplay-item code pointer"
                  :for="role"
                  :title="role"
                  >{{ truncateName(role, 20) }}</label
                >
              </div>
            </b-dropdown-text>
            <b-dropdown-text v-if="roleList.length === 0">
              <span class="inlineDisplay-item">
                No roles found.
              </span>
            </b-dropdown-text>
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
import { truncateName } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'Filters',
  components: {},
  props: {
    labelSearchButton: {
      type: String,
      required: false,
      default: 'search'
    },
    currentFilter: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      roleList: [],
      selectedRoles: []
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper']),
    hasFilter() {
      return this.selectedRoles.length > 0
    }
  },
  methods: {
    truncateName,
    async fetchRoleList() {
      const res = await this.wrapper.performSearchRoles()
      this.roleList = res.documents.map(role => role._id)
    },
    roleIsSelected(role) {
      return this.selectedRoles.includes(role)
    },
    toggleRole(role, value) {
      if (!value) {
        this.selectedRoles.splice(this.selectedRoles.indexOf(role), 1)
      } else {
        this.selectedRoles.push(role)
      }
    },
    reset() {
      this.selectedRoles = []
      this.$emit('reset')
    }
  },
  mounted() {
    this.fetchRoleList()
    this.selectedRoles = this.currentFilter.map(role => role)
  },
  watch: {
    selectedRoles() {
      this.$emit('filters-updated', this.selectedRoles)
    }
  }
}
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
</style>
