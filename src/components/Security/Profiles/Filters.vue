<template>
  <div class="search-filter">
    <div v-if="(!basicFilter && !rawFilter && !sorting) && quickFilterEnabled" class="card-panel card-header">
      <div class="row margin-bottom-0 filters">
        <quick-filter
          :search-term="searchTerm"
          :display-block-filter="displayBlockFilter"
          @filters-display-block-filter="displayBlockFilter = !displayBlockFilter"
          @filters-quick-search="broadcastFilterQuickSearch">
        </quick-filter>
      </div>
    </div>

    <div v-if="(basicFilter || rawFilter || sorting) || !quickFilterEnabled" class="complex-search card-panel card-header filters">
      <div class="row margin-bottom-0">
        <div class="col s8 m6 l4" style="min-width: 520px">
          <div class="search-bar">
            <i class="fa fa-search search"></i>
            <div class="chip">
              <span class="label-chip" @click.prevent="displayBlockFilter = true">{{labelComplexQuery}}</span>
              <i class="close fa fa-close" v-if="quickFilterEnabled" @click.prevent="resetComplexSearch"></i>
            </div>
            <a v-if="!displayBlockFilter" href="#" class="fluid-hover" @click.prevent="displayBlockFilter = true">More query options</a>
            <a v-else href="#" class="fluid-hover" @click.prevent="displayBlockFilter = false">Less query options</a>
          </div>
        </div>
        <div class="col s4 m3 l3 actions-quicksearch">
          <button type="submit" class="btn btn-small waves-effect waves-light" @click="refreshSearch">{{labelSearchButton}}</button>
          <button class="btn-flat btn-small waves-effect waves-light" @click="resetComplexSearch">reset</button>
        </div>
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
  import Tabs from '../../Materialize/Tabs'
  import Tab from '../../Materialize/Tab'
  import QuickFilter from '../Common/Filters/QuickFilter'
  import BasicFilter from '../Common/Filters/BasicFilter'
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
      sortingEnabled: {
        type: Boolean,
        required: false,
        'default': true
      },
      labelSearchButton: {
        type: String,
        required: false,
        'default': 'search'
      },
      labelComplexQuery: {
        type: String,
        required: false,
        'default': 'Complex query here'
      },
      rawFilter: Object,
      basicFilter: [Array, Object],
      setBasicFilter: Function,
      searchTerm: String,
      sorting: Object
    },
    components: {
      Tabs,
      Tab,
      QuickFilter,
      BasicFilter,
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
        tabActive: 'basic',
        jsonInvalid: false,
        objectTabActive: null,
        addedRoles: []
      }
    },
    methods: {
      broadcastFilterQuickSearch (term) {
        this.$emit('filters-quick-search', term)
      },
      switchFilter (name) {
        this.tabActive = name
      },
      resetComplexSearch () {
        this.$emit('filters-raw-search', {})
      },
      refreshSearch () {
        this.$emit('filters-refresh-search')
      },
      broadcastFilterBasicSearch (filters, sorting) {
        this.displayBlockFilter = false
        this.$emit('filters-basic-search', filters, sorting)
      },
      setObjectTabActive (tab) {
        this.objectTabActive = tab
      },
      broadcastRawSearch (filter) {
        this.$emit('filters-raw-search', filter)
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
