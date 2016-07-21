<template>
  <div>
    <div class="row">
      <div class="col s9 quick-search" v-if="!displayBlockFilter">
        <div class="row">
          <form>
            <div class="col s5">
              <div class="search-bar">
                <i class="fa fa-search"></i>
                <input type="text" placeholder="Search something..." @input="setSearchTerm"/>
                <i class="fa fa-times remove-search" @click="removeSearchTerm"></i>
              </div>
            </div>
            <div class="col s3">
              <button type="submit" class="btn waves-effect waves-light" @click="newSearch">Search</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col s8 z-depth-1" v-if="displayBlockFilter">
        <tabs @tab-changed="switchFilter" :active="tabActive">
          <tab name="basic"><a href="">Basic filters</a></tab>
          <tab name="advanced"><a href="#!/tabs/2">Advanced filters</a></tab>

          <div slot="contents">
            <div class="col s12 filter-content">
              <div v-if="tabActive === 'basic'">
                <div class="row">
                  <div class="col s8">
                    <div class="row">
                      <div class="col s3">
                        <input placeholder="Attribute" type="text" class="validate">
                      </div>
                      <div class="col s3">
                        <select v-m-select>
                          <option value="match">Match</option>
                        </select>
                      </div>
                      <div class="col s3">
                        <input placeholder="Placeholder" type="text" class="validate">
                      </div>
                      <div class="col s3">
                        <button class="inline btn waves-effect waves-light"><i class="fa fa-plus left"></i>And</button>
                      </div>
                    </div>
                    <hr/>
                    <div class="row">
                      <button class="btn waves-effect waves-light"><i class="fa fa-plus left"></i>Or</button>
                    </div>
                    <hr/>
                    <div class="row">
                      <button class="btn waves-effect waves-light">Filter</button>
                      <button class="btn-flat">Reset</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script>
  import Tabs from '../Layout/Tabs'
  import Tab from '../Layout/Tab'
  import MSelect from '../Layout/MSelect'
  import { setSearchTerm, performSearch } from '../../vuex/modules/collection/actions'
  import { searchUsers } from '../../vuex/modules/collection/users-actions'
  import { search } from '../../vuex/modules/collection/getters'

  export default {
    directives: {
      MSelect
    },
    components: {
      Tabs,
      Tab
    },
    vuex: {
      getters: {
        search
      },
      actions: {
        setSearchTerm,
        performSearch,
        searchUsers
      }
    },
    data () {
      return {
        displayBlockFilter: false,
        tabActive: 'basic'
      }
    },
    methods: {
      switchFilter (name) {
        this.tabActive = name
      },
      newSearch () {
        this.performSearch('users', '%kuzzle')
      },
      removeSearchTerm () {
        this.setSearchTerm('')
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .filter-content {
    margin-top: 15px;

    button {
      i.left {
        margin-right: 8px;
      }
      padding-left: 10px;
      padding-right: 10px;
      margin-top: 6px;
    }
  }

  .quick-search {
    button {
      margin-top: 2px;
    }

    .search-bar {
      position: relative;
      i {
        position: absolute;
        font-size: 1.3rem;
        margin-left: 4px;
        margin-top: 13px;
        &.remove-search {
          right: 48px;
          cursor: pointer;
        }
      }
      input {
        height: 48px;
        padding-left: 34px;
        margin-bottom: 0;
        width: 84%;
      }
    }
  }
</style>