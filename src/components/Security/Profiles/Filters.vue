<template>
  <div class="search-filter">
    <div v-if="!basicFilter && quickFilterEnabled" class="card-panel card-header">
      <div class="row margin-bottom-0 filters">
        <quick-filter
          :search-term="searchTerm"
          :display-block-filter="displayBlockFilter"
          @filters-display-block-filter="displayBlockFilter = !displayBlockFilter"
          @filters-quick-search="broadcastFilterQuickSearch">
        </quick-filter>
      </div>
    </div>

    <div class="row card-panel open-search" v-show="displayBlockFilter">
      <i class="fa fa-times close" @click="displayBlockFilter = false"></i>
      <div class="col s11">
        <role-list
                class="role-list"
                :added-roles="addedRoles"
                @selected-role="selectedRole"
                @remove-role="removeRole"
        ></role-list>

        <div class="row card-action">
          <button type="submit" class="btn waves-effect waves-light primary" @click.prevent="basicSearch">{{labelSearchButton}}</button>
          <button class="btn-flat waves-effect waves-light" @click="resetBasicSearch">Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style type="text/css">
  .role-list {
    margin-top: 20px;
  }
</style>

<script>
  import QuickFilter from '../Common/Filters/QuickFilter'
  import RoleList from './RoleList'
  import MSelect from '../../Common/MSelect'
  import Vue from 'vue'

  export default {
    name: 'Filters',
    props: {
      availableFilters: {
        type: Object,
        required: true
      },
      quickFilterEnabled: {
        type: Boolean,
        required: false,
        'default': true
      },
      labelSearchButton: {
        type: String,
        required: false,
        'default': 'search'
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
    watch: {
      'displayBlockFilter' () {
        this.$emit('json-editor-refresh')
      },
      'tabActive' () {
        this.$emit('json-editor-refresh')
      }
    },
    data () {
      return {
        displayBlockFilter: false,
        addedRoles: []
      }
    },
    methods: {
      broadcastFilterQuickSearch (term) {
        this.$emit('filters-quick-search', term)
      },
      refreshSearch () {
        this.$emit('filters-refresh-search')
      },
      selectedRole (role) {
        this.addedRoles.push(role)
      },
      removeRole (role) {
        this.addedRoles.splice(this.addedRoles.indexOf(role), 1)
      },
      basicSearch () {
        this.$emit('filters-basic-search', {roles: this.addedRoles})
      },
      resetBasicSearch () {
        this.addedRoles = []
      }
    },
    mounted () {
      Vue.nextTick(() => {
        window.document.addEventListener('keydown', this.handleEsc)
      })

      const filter = JSON.parse(this.$store.state.route.query.basicFilter || '[]')

      if (filter.roles) {
        this.addedRoles = filter.roles ? filter.roles : []

        this.displayBlockFilter = true
      }
    },
    destroyed () {
      window.document.removeEventListener('keydown', this.handleEsc)
    }
  }
</script>
