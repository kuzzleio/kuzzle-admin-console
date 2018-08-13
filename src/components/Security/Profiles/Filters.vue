<template>
  <div class="search-filter">
    <div class="row card-panel card-header">
      <div class="col s7">
        <role-list
                class="role-list"
                :added-roles="addedRoles"
                @selected-role="selectedRole"
                @remove-role="removeRole"
        ></role-list>
      </div>
      <div class="col s3 actions-quicksearch">
        <button type="submit" class="btn btn-small waves-effect waves-light"@click.prevent="basicSearch">{{labelSearchButton}}</button>
        <button class="btn-flat btn-small waves-effect waves-light" @click="resetBasicSearch">Reset</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.actions-quicksearch {
  height: 48px;
  line-height: 48px;
}
</style>

<script>
import QuickFilter from '../Common/Filters/QuickFilter'
import RoleList from './RoleList'
import MSelect from '../../Common/MSelect'

export default {
  name: 'Filters',
  props: {
    quickFilterEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    labelSearchButton: {
      type: String,
      required: false,
      default: 'search'
    },
    basicFilter: [Array, Object],
    setBasicFilter: Function,
    searchTerm: String
  },
  components: {
    QuickFilter,
    RoleList,
    MSelect
  },
  data() {
    return {
      addedRoles: []
    }
  },
  methods: {
    broadcastFilterQuickSearch(term) {
      this.$emit('filters-quick-search', term)
    },
    refreshSearch() {
      this.$emit('filters-refresh-search')
    },
    selectedRole(role) {
      this.addedRoles.push(role)
    },
    removeRole(role) {
      this.addedRoles.splice(this.addedRoles.indexOf(role), 1)
    },
    basicSearch() {
      this.$emit('filters-basic-search', { roles: this.addedRoles })
    },
    resetBasicSearch() {
      this.addedRoles = []
    }
  }
}
</script>
