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
            <div class="col s12 filter-content">
              <div v-if="tabActive === 'basic'">
                <div class="row">
                  <div class="col s8">

                    <div class="row block-and">
                      <p><i class="fa fa-search"></i>Query</p>
                      <div class="row dots block-content">
                        <div class="col s4">
                          <input placeholder="Attribute" type="text" class="validate">
                        </div>
                        <div class="col s4">
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
                    </div>

                    <div class="row">
                      <button class="btn waves-effect waves-light"><i class="fa fa-plus left"></i>Or</button>
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
                    <div class="row actions card-action">
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
  import { setSearchTerm, performSearch, resetSearchTerm } from '../../vuex/modules/collection/actions'
  import { searchUsers } from '../../vuex/modules/collection/users-actions'
  import { searchTerm } from '../../vuex/modules/collection/getters'

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
        searchTerm
      },
      actions: {
        setSearchTerm,
        performSearch,
        searchUsers,
        resetSearchTerm
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
      margin-top: 15px;

      .dots {
        border-left: 1px dotted rgba(0,0,0,0.26);
        padding-bottom: 5px;
      }
      .block-and {
        margin-bottom: 5px;
        button {
          i.left {
            margin-right: 8px;
          }
          padding-left: 10px;
          padding-right: 10px;
          margin-top: 6px;
        }
      }
      .block-sort {
        margin-top: 30px;
        margin-bottom: 0;
      }
      .block-content {
        margin-left: 5px;
      }
      p {
        i {
          font-size: 1.1em;
          margin-right: 10px;
        }
      }

      .actions {
        &.card-action {
          padding: 10px;
          button {
            margin-top: 10px;
            margin-right: 10px;
          }
        }
      }
    }
  }
</style>