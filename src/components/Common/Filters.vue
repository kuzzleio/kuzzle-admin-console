<template>
  <div>
    <div class="row">
      <div class="col s9 quick-search">
        <div class="row">
          <form>
            <div class="col s7">
              <div class="search-bar">
                <i class="fa fa-search search"></i>
                <input type="text" placeholder="Search something..." v-model="searchTerm"/>
                <a href="#" @click.prevent="displayBlockFilter = true">More query options</a>
                <i class="fa fa-times remove-search" @click="searchTerm = null"></i>
              </div>
            </div>
            <div class="col s3">
              <button type="submit" class="btn waves-effect waves-light" @click.prevent="quickSearch">Search</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col s8 z-depth-2 open-search" v-show="displayBlockFilter">
        <i class="fa fa-times close" @click="displayBlockFilter = false"></i>
        <tabs @tab-changed="switchFilter" :active="tabActive">
          <tab name="basic"><a href="">Basic Mode</a></tab>
          <tab name="json"><a href="">Raw JSON Mode</a></tab>

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
                              @click="btn addAndBasicFilter(groupIndex)">
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
                          <input placeholder="Attribute" type="text" class="validate" v-model="filters.sort.attribute">
                        </div>
                        <div class="col s2">
                          <select v-m-select="filters.sort.order">
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

  const ESC_KEY = 27
  const emptyBasicFilter = {attribute: null, operator: 'match', value: null}

  export default {
    directives: {
      MSelect
    },
    components: {
      Tabs,
      Tab
    },
    data () {
      return {
        displayBlockFilter: false,
        tabActive: 'basic',
        searchTerm: null,
        filters: {
          basic: [[{...emptyBasicFilter}]],
          raw: null,
          sort: {
            attribute: null,
            order: 'asc'
          }
        }
      }
    },
    events: {
      'filters-close-block-filter' () {
        this.displayBlockFilter = false
      }
    },
    methods: {
      switchFilter (name) {
        this.tabActive = name
      },
      quickSearch () {
        this.$emit('filters-quick-search', this.searchTerm)
      },
      basicSearch () {
        this.$emit('filters-basic-search', this.filters.basic, this.filters.sort)
      },
      resetBasicSearch () {
        this.filters.basic = [[{...emptyBasicFilter}]]
        this.filters.sort = {attribute: null, order: 'asc'}
      },
      rawSearch () {
        this.$emit('filters-advanced-search', this.filters.raw)
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
</style>