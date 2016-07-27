<template>
  <div>
    <div class="row">
      <div v-if="!complexSearch" class="col s9 quick-search">
        <div class="row">
          <form>
            <div class="col s7">
              <div class="search-bar">
                <i class="fa fa-search search"></i>
                <input type="text" placeholder="Search something..." v-model="filters.quickSearch"/>
                <a href="#" @click.prevent="displayBlockFilter = true">More query options</a>
                <i class="fa fa-times remove-search" @click="resetQuickSearch"></i>
              </div>
            </div>
            <div class="col s3">
              <button type="submit" class="btn waves-effect waves-light" @click.prevent="quickSearch">Search</button>
            </div>
          </form>
        </div>
      </div>
      <div v-if="complexSearch" class="col s9 complex-search">
        <div class="row">
          <div class="col s7">
            <div class="search-bar">
              <i class="fa fa-search search"></i>
              <div class="chip" @click="displayBlockFilter = true">
                Complex query here
                <i class="close fa fa-close" @click.prevent="resetComplexSearch"></i>
              </div>
              <a href="#" @click.prevent="displayBlockFilter = true">More query options</a>
              <i class="fa fa-times remove-search" @click="resetComplexSearch"></i>
            </div>
          </div>
          <div class="col s3">
            <button type="submit" class="btn waves-effect waves-light" @click.prevent="quickSearch">Search</button>
          </div>
        </div>
      </div>

      <div class="col s8 z-depth-1 open-search" v-show="displayBlockFilter">
        <i class="fa fa-times close" @click="displayBlockFilter = false"></i>
        <tabs @tab-changed="switchFilter" :active="tabActive" :is-displayed="displayBlockFilter">
          <tab name="basic"><a href="">Basic Mode</a></tab>
          <tab name="raw"><a href="">Raw JSON Mode</a></tab>

          <div slot="contents" class="card">
            <div class="col s12">
              <div v-show="tabActive === 'basic'">
                <form>
                <div class="row filter-content">
                  <div class="col s12">

                    <div class="row block-and">
                      <p><i class="fa fa-search"></i>Query</p>
                      <div v-for="(groupIndex, group) in filters.basic" class="row block-content">
                        <div v-for="(filterIndex, filter) in group" class="row dots group">
                          <div class="col s4">
                            <input placeholder="Attribute" type="text" class="validate" v-model="filter.attribute">
                          </div>
                          <div class="col s2">
                            <select v-m-select="filter.operator">
                              <option value="match">Match</option>
                              <option value="not_match">Not match</option>
                              <option value="equal">Equal</option>
                              <option value="not_equal">Not equal</option>
                            </select>
                          </div>
                          <div class="col s3">
                            <input placeholder="Value" type="text" class="validate" v-model="filter.value">
                          </div>
                          <div class="col s2">
                            <i class="fa fa-times remove-filter"
                              @click="removeAndBasicFilter(groupIndex, filterIndex)"></i>
                            <a
                              v-if="$index === group.length - 1"
                              class="inline btn waves-effect waves-light"
                              @click="addAndBasicFilter(groupIndex)">
                                <i class="fa fa-plus left"></i>And
                            </a>
                          </div>
                        </div>
                        <p v-if="groupIndex < filters.basic.length - 1">Or</p>
                      </div>
                    </div>

                    <div class="row">
                      <a class="btn waves-effect waves-light" @click="addGroupBasicFilter">
                        <i class="fa fa-plus left"></i>Or
                      </a>
                    </div>

                    <div class="row block-sort">
                      <p><i class="fa fa-sort-amount-asc"></i>Sorting</p>
                      <div class="row block-content" >
                        <div class="col s4">
                          <input placeholder="Attribute" type="text" class="validate" v-model="filters.sorting.attribute">
                        </div>
                        <div class="col s2">
                          <select v-m-select="filters.sorting.order">
                            <option value="asc">asc</option>
                            <option value="desc">desc</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
                <div class="row card-action">
                  <button type="submit" class="btn waves-effect waves-light" @click.prevent="basicSearch">Search</button>
                  <button class="btn waves-effect waves-light" @click="resetBasicSearch">Reset</button>
                </div>
                </form>
              </div>

              <div v-show="tabActive === 'raw'">
                <form>
                  <button class="btn waves-effect waves-light" @click="fillRawWithBasic">Fill from basic form</button>
                  <json-editor
                    v-ref:jsoneditor
                    class="pre_ace"
                    :content="filters.raw"
                  >
                  </json-editor>
                  <div class="row card-action">
                    <button type="submit" class="btn waves-effect waves-light" @click.prevent="rawSearch">Search</button>
                    <button class="btn waves-effect waves-light" @click="resetRawSearch">Reset</button>
                    <span class="error" v-if="jsonInvalid">Your JSON is not valid</span>
                  </div>
                </form>
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
  import Tabs from '../Materialize/Tabs'
  import Tab from '../Materialize/Tab'
  import MSelect from '../Materialize/MSelect'
  import JsonEditor from '../Common/JsonEditor'
  import { formatFromBasicSearch, formatSort } from '../../services/filterFormat'

  const ESC_KEY = 27
  const emptyBasicFilter = {attribute: null, operator: 'match', value: null}

  export default {
    name: 'Filters',
    props: ['initSearch'],
    directives: {
      MSelect
    },
    components: {
      Tabs,
      Tab,
      JsonEditor
    },
    watch: {
      'displayBlockFilter' () {
        this.$broadcast('json-editor-refresh')
      },
      'tabActive' () {
        this.$broadcast('json-editor-refresh')
      },
      'initSearch': {
        deep: true,
        handler () {
          // pre-fill search bar, or form basic search, or json for raw search
          if (this.initSearch.quickSearch) {
            this.filters.quickSearch = this.initSearch.quickSearch
            this.complexSearch = false
          } else if (this.initSearch.basicSearch) {
            this.filters.basic = this.initSearch.basicSearch.filters
            this.filters.sorting = this.initSearch.basicSearch.sorting
            this.complexSearch = true
            this.tabActive = 'basic'
          } else if (this.initSearch.rawSearch) {
            this.filters.raw = this.initSearch.rawSearch
            this.complexSearch = true
            this.tabActive = 'raw'
          }
        }
      }
    },
    data () {
      return {
        displayBlockFilter: false,
        complexSearch: false,
        tabActive: 'basic',
        jsonInvalid: false,
        filters: {
          quickSearch: null,
          basic: [[{...emptyBasicFilter}]],
          raw: {},
          sorting: {
            attribute: null,
            order: 'asc'
          }
        }
      }
    },
    methods: {
      switchFilter (name) {
        this.tabActive = name
      },
      quickSearch () {
        this.$emit('filters-quick-search', this.filters.quickSearch)
      },
      resetQuickSearch () {
        this.filters.quickSearch = null
      },
      basicSearch () {
        this.$emit('filters-basic-search', this.filters.basic, this.filters.sorting)
        this.complexSearch = true
        this.displayBlockFilter = false
      },
      resetComplexSearch () {
        this.resetBasicSearch()
        this.resetRawSearch()
      },
      resetBasicSearch () {
        this.filters.basic = [[{...emptyBasicFilter}]]
        this.filters.sorting = {attribute: null, order: 'asc'}
        this.complexSearch = false
      },
      fillRawWithBasic () {
        let formattedFilter = formatFromBasicSearch(this.filters.basic)
        let sort = formatSort(this.filters.sorting)
        this.filters.raw = {...formattedFilter, sort}
        this.$broadcast('json-editor-refresh')
      },
      rawSearch () {
        let json = this.$refs.jsoneditor.getJson()

        if (json === null) {
          this.jsonInvalid = true
          return
        }

        this.jsonInvalid = false
        this.filters.raw = json

        this.$emit('filters-raw-search', this.filters.raw)
        this.complexSearch = true
        this.displayBlockFilter = false
      },
      resetRawSearch () {
        this.filters.raw = {}
        this.complexSearch = false
      },
      addGroupBasicFilter () {
        this.filters.basic.push([{...emptyBasicFilter}])
      },
      addAndBasicFilter (groupIndex) {
        this.filters.basic[groupIndex].push({...emptyBasicFilter})
      },
      removeAndBasicFilter (groupIndex, filterIndex) {
        if (this.filters.basic.length === 1 && this.filters.basic[0].length === 1) {
          this.filters.basic[0].$set(0, {...emptyBasicFilter})
          return
        }

        if (this.filters.basic[groupIndex].length === 1 && this.filters.basic.length > 1) {
          this.filters.basic.splice(groupIndex, 1)
          return
        }

        this.filters.basic[groupIndex].splice(filterIndex, 1)
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
  .search-bar {
    position: relative;

    a {
      position: absolute;
      right: 70px;
      top: 50%;
      transform: translateY(-50%);
      text-decoration: underline;
    }
    i {
      position: absolute;
      font-size: 1.3rem;
      margin-left: 4px;
      color: grey;
      top: 50%;
      transform: translateY(-50%);
      &.remove-search {
        right: 20px;
        cursor: pointer;
      }
      &.search {
        pointer-events: none;
      }
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

  .quick-search {
    button {
      margin-top: 8px;
    }
  }

  .complex-search {
    margin-top: 8px;
    button {
    }
    .search-bar {
      .chip {
        margin-left: 30px;
        cursor: pointer;
        i {
          position: relative;
          cursor: pointer;
          float: right;
          font-size: 13px;
          line-height: 32px;
          padding-left: 8px;
        }
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
        a.btn {
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
  .pre_ace, .ace_editor {
    height: 350px;
  }
</style>