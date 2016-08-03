<template>
  <div>
    <div class="row">
      <div class="col s8 z-depth-1 open-search" v-show="displayBlockFilter">
        <i class="fa fa-times close" @click="displayBlockFilter = false"></i>
        <tabs @tab-changed="switchFilter" :active="tabActive" :is-displayed="displayBlockFilter">
          <tab name="basic"><a href="">Basic Mode</a></tab>
          <tab name="raw"><a href="">Raw JSON Mode</a></tab>

          <div slot="contents" class="card">
            <div class="col s12">
              <div v-show="tabActive === 'basic'">
                <basic-filter
                  :basic-filter="basicFilter"
                  :sorting="sorting"
                  :set-basic-filter="setBasicFilter"
                  @filters-basic-search="complexSearch = true">
                </basic-filter>
              </div>

              <div v-show="tabActive === 'raw'">
                <raw-filter
                  :raw-filter="rawFilter"
                  :format-from-basic-search="formatFromBasicSearch"
                  :format-sort="formatSort"
                  :basic-filter-form="basicFilterForm">
                </raw-filter>
              </div>
            </div>
          </div>
        </tabs>
      </div>

      <quick-filter
        :search-term="searchTerm"
        @filters-display-block-filter="displayBlockFilter = true">
      </quick-filter>

      <div v-if="(basicFilter || rawFilter || sorting)" class="col s9 complex-search">
        <div class="row">
          <div class="col s7">
            <div class="search-bar">
              <i class="fa fa-search search"></i>
              <div class="chip">
                <span @click="displayBlockFilter = true">Complex query here</span>
                <i class="close fa fa-close" @click.prevent="resetComplexSearch"></i>
              </div>
              <a href="#" @click.prevent="displayBlockFilter = true">More query options</a>
              <i class="fa fa-times remove-search" @click="resetComplexSearch"></i>
            </div>
          </div>
          <div class="col s3">
            <button type="submit" class="btn waves-effect waves-light" @click="refreshSearch">Search</button>
          </div>
        </div>
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
  import Tabs from '../../Materialize/Tabs'
  import Tab from '../../Materialize/Tab'
  import QuickFilter from './QuickFilter'
  import BasicFilter from './BasicFilter'
  import RawFilter from './RawFilter'

  const ESC_KEY = 27

  export default {
    name: 'Filters',
    props: ['rawFilter', 'basicFilter', 'setBasicFilter', 'basicFilterForm', 'searchTerm', 'sorting', 'formatFromBasicSearch', 'formatSort'],
    components: {
      Tabs,
      Tab,
      QuickFilter,
      BasicFilter,
      RawFilter
    },
    watch: {
      'displayBlockFilter' () {
        this.$broadcast('json-editor-refresh')
      },
      'tabActive' () {
        this.$broadcast('json-editor-refresh')
      }
    },
    events: {
      'filters-basic-search' () {
        this.displayBlockFilter = false
      },
      'filters-raw-search' () {
        this.displayBlockFilter = false
      }
    },
    data () {
      return {
        displayBlockFilter: false,
        tabActive: 'basic',
        jsonInvalid: false
      }
    },
    methods: {
      switchFilter (name) {
        this.tabActive = name
      },
      resetComplexSearch () {
        this.$dispatch('filters-raw-search', {})
      },
      refreshSearch () {
        this.$dispatch('filters-refresh-search')
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

<style lang="scss" rel="stylesheet/scss">
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