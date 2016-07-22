<template>
  <div>
    <div class="row">
      <div class="col s9 quick-search">
        <div class="row">
          <form>
            <div class="col s6">
              <div class="search-bar">
                <i class="fa fa-search search"></i>
                <input type="text" placeholder="Search something..." @input="setSearchTerm" :value="searchTerm"/>
                <a href="#" @click.prevent="displayBlockFilter = true">More query options</a>
                <i class="fa fa-times remove-search" @click="resetSearchTerm"></i>
              </div>
            </div>
            <div class="col s3">
              <button type="submit" class="btn waves-effect waves-light" @click="newSearch">Search</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col s8 z-depth-2 open-search" v-if="displayBlockFilter">
        <i class="fa fa-times close" @click="displayBlockFilter = false"></i>
        <tabs @tab-changed="switchFilter" :active="tabActive">
          <tab name="basic"><a href="">Basic Mode</a></tab>
          <tab name="json"><a href="">Raw JSON Mode</a></tab>

          <div slot="contents" class="card">
            <div class="col s12">
              <div v-if="tabActive === 'basic'">
                <div class="row filter-content">
                  <div class="col s8">

                    <div class="row block-and">
                      <p><i class="fa fa-search"></i>Query</p>
                      <div v-for="(groupIndex, group) in basicFilters" class="row block-content">
                        <div v-for="(filterIndex, filter) in group" track-by="$index" class="row dots group">
                          <div class="col s4">
                            <input placeholder="Attribute" type="text" class="validate" :value="filter.attribute">
                          </div>
                          <div class="col s2">
                            <select v-m-select>
                              <option value="match">Match</option>
                            </select>
                          </div>
                          <div class="col s3">
                            <input placeholder="Value" type="text" class="validate" :value="filter.value">
                          </div>
                          <div class="col s2">
                            <i class="fa fa-times remove-filter"
                              @click="removeAndBasicFilter(groupIndex, filterIndex)"></i>
                            <button
                              v-if="$index === group.length - 1"
                              class="inline btn waves-effect waves-light"
                              @click="addAndBasicFilter(groupIndex)">
                                <i class="fa fa-plus left"></i>And
                            </button>
                          </div>
                        </div>
                        <p v-if="filterIndex !== basicFilters.length - 1">Or</p>
                      </div>
                    </div>

                    <div class="row">
                      <button class="btn waves-effect waves-light" @click="addGroupBasicFilter">
                        <i class="fa fa-plus left"></i>Or
                      </button>
                    </div>

                    <div class="row block-sort">
                      <p><i class="fa fa-sort-amount-asc"></i>Sorting</p>
                      <div class="row block-content">
                        <div class="col s4">
                          <input placeholder="Attribute" type="text" class="validate">
                        </div>
                        <div class="col s2">
                          <select v-m-select>
                            <option value="match">asc</option>
                            <option value="match">desc</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
                    <div class="row card-action">
                      <button class="btn waves-effect waves-light">Search</button>
                      <button class="btn waves-effect waves-light">Reset</button>
                    </div>
              </div>
            </div>
          </div>
        </tabs>
      </div>

      <div
        v-if="displayBlockFilter"
        @click="displayBlockFilter = false"
        class="lean-overlay"
        style="z-index: 1000; display: block; opacity: 0;">
      </div>
    </div>
  </div>
</template>

<script>
  import Tabs from '../Layout/Tabs'
  import Tab from '../Layout/Tab'
  import MSelect from '../Layout/MSelect'
  import { setSearchTerm, performSearch, resetSearchTerm, addGroupBasicFilter, addAndBasicFilter, removeAndBasicFilter } from '../../vuex/modules/collection/actions'
  import { searchUsers } from '../../vuex/modules/collection/users-actions'
  import { searchTerm, basicFilters } from '../../vuex/modules/collection/getters'

  const ESC_KEY = 27

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
        searchTerm,
        basicFilters
      },
      actions: {
        setSearchTerm,
        performSearch,
        searchUsers,
        resetSearchTerm,
        addGroupBasicFilter,
        addAndBasicFilter,
        removeAndBasicFilter
      }
    },
    data () {
      return {
        displayBlockFilter: true,
        tabActive: 'basic'
      }
    },
    methods: {
      switchFilter (name) {
        this.tabActive = name
      },
      newSearch () {
        this.performSearch('users', '%kuzzle')
      }
    },
    ready () {
      window.document.addEventListener('keydown', evt => {
        evt = evt || window.event

        if (evt.keyCode === ESC_KEY) {
          this.displayBlockFilter = false
        }
      })
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
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
        color: grey;
        &.remove-search {
          right: 20px;
          cursor: pointer;
          top: 0;
        }
        &.search {
          pointer-events: none;
        }
      }
      a {
        position: absolute;
        right: 70px;
        top: 50%;
        transform: translateY(-50%);
        text-decoration: underline;
      }
      input {
        height: 48px;
        padding-left: 34px;
        margin-bottom: 0;
        width: 100%;
        padding-right: 215px;
        box-sizing: border-box;
      }
    }
  }

  .open-search {
    position: absolute;
    z-index: 1001;
    background-color: #fff;

    i.close {
      float: right;
      font-size: 1.3em;
      cursor: pointer;
      margin-top: 5px;
      color: grey;
    }

    .filter-content {
      margin-bottom: 0;
      .dots {
        border-left: 1px dotted rgba(0,0,0,0.26);
        padding-bottom: 5px;
      }
      .block-and {
        margin-bottom: 5px;
        i.remove-filter {
          margin-top: 25px;
          color: grey;
          cursor: pointer;
        }
        button {
          i.left {
            margin-right: 8px;
          }
          padding-left: 10px;
          padding-right: 10px;
          margin-left: 10px;
        }
      }
      .block-sort {
        margin-top: 40px;
        margin-bottom: 0;
      }
      .block-content {
        margin-left: 5px;
        margin-bottom: 5px;
        .group {
          margin-bottom: 0;
        }
      }
      p {
        margin-bottom: 10px;
        margin-top: 10px;
        i {
          font-size: 1.1em;
          margin-right: 10px;
        }
      }
    }
    .card-action {
      padding: 15px;
      margin-bottom: 0;
      button {
        margin-right: 10px;
      }
    }
  }
</style>