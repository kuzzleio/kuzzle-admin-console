<template>
  <Multipane class="DataLayout Custom-resizer" layout="vertical">
    <div class="DataLayout-sidebarWrapper" data-cy="DataLayout-sidebarWrapper">
      <!-- <QueryList
        :savedQueries="savedQueries"
        :currentQueryName="currentQueryName"
        @deleteSavedQuery="deleteSavedQuery"
        @loadSavedQuery="loadSavedQuery"
      /> -->
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper">
      <b-container fluid class="queryContainer">
        <b-row align-v="stretch">
          <b-col cols="12">
            <InfoAlert />
          </b-col>
          <b-col cols="12" v-if="loading"> </b-col>
          <b-col cols="12" v-else>
            <b-card no-body>
              <b-tabs card content-class="mt-3">
                <b-tab
                  v-for="(tabContent, tabIdx) of tabs"
                  :key="`query-${tabIdx}-${tabContent.name}`"
                  :active="currentTabIdx === tabIdx"
                  @click.prevent=""
                  title-link-class="px-0 py-1"
                >
                  <template #title>
                    <strong
                      class="py-2 pl-3 pr-4"
                      @click="setCurrentTab(tabIdx)"
                      >{{ tabContent.name ? tabContent.name : 'New query' }}
                      {{ tabContent.saved ? '' : ' *' }}
                    </strong>
                    <i
                      class="fas fa-times pl-2 py-2 pr-3"
                      @click="closeTab(tabIdx)"
                    />
                  </template>
                  <QueryCard
                    :query="tabContent.query"
                    :tabIdx="tabIdx"
                    :controllers="controllers"
                    :actions="actions"
                    :indexes="indexes"
                    :collections="collections"
                    @queryChanged="queryChanged"
                    @perfomQuery="performQuery"
                  />
                  <ResponseCard :response="tabContent.response" />
                </b-tab>
                <template #tabs-end>
                  <b-nav-item
                    role="presentation"
                    @click.prevent="newTab"
                    href="#"
                    ><b>+</b></b-nav-item
                  >
                </template>
              </b-tabs>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <!-- <SaveQueryModal
      :isQueryNameValid="isQueryNameValid"
      @queryNameValidated="queryNameValidated"
    /> -->
  </Multipane>
</template>

<script>
import InfoAlert from '@/components/ApiAction/InfoAlert'
import ResponseCard from '@/components/ApiAction/ResponseCard'
// import SaveQueryModal from '@/components/ApiAction/SaveQueryModal'
// import QueryList from '@/components/ApiAction/QueryList'
import QueryCard from '@/components/ApiAction/QueryCard'

import { Multipane, MultipaneResizer } from 'vue-multipane'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  components: {
    Multipane,
    MultipaneResizer,
    ResponseCard,
    InfoAlert,
    QueryCard
    // SaveQueryModal,
    // QueryList
  },
  data() {
    return {
      tabs: [],
      currentTabIdx: 0,
      api: null,
      loading: true,
      savedQueries: []
    }
  },
  computed: {
    // computed kuzzle api
    ...mapGetters('kuzzle', ['wrapper', 'currentEnvironment']),
    storage() {
      return this.$store.direct.getters.index.indexes
    },
    indexes() {
      return this.storage.map(i => i.name)
    },
    collections() {
      if (!this.currentQueryIndexName) {
        return []
      }
      const index = this.storage.find(
        i => i.name === this.currentQueryIndexName
      )
      return index && index.collections
        ? index.collections.map(c => c.name)
        : []
    },
    controllers() {
      return this.api ? Object.keys(this.api) : []
    },
    actions() {
      if (!this.tabs[this.currentTabIdx]) {
        return []
      }
      const currentController = this.tabs[this.currentTabIdx].query.controller
      return currentController && this.api[currentController]
        ? Object.keys(this.api[currentController])
        : []
    },

    // computed component
    emptyTab() {
      return {
        query: {
          controller: null,
          action: null,
          _id: null,
          index: null,
          collection: null,
          body: '{}'
        },
        saved: false,
        name: '',
        response: ''
      }
    },
    currentQueryIndexName() {
      if (!this.tabs[this.currentTabIdx]) {
        return null
      }
      return this.tabs[this.currentTabIdx].query.index
    },
    // currentQueryIdx() {
    //   if (!this.tabs[this.currentTabIdx]) {
    //     return null
    //   }
    //   return this.tabs[this.currentTabIdx].idx
    // },
    currentQueryBody() {
      if (!this.tabs[this.currentTabIdx]) {
        return null
      }
      return this.tabs[this.currentTabIdx].body
    }
    // currentQueryName() {
    //   if (!this.tabs[this.currentTabIdx]) {
    //     return null
    //   }
    //   return this.tabs[this.currentTabIdx].name
    // },
  },
  methods: {
    queryChanged({ query, tabIdx }) {
      this.tabs[tabIdx].query = _.clone(query)
    },
    setCurrentTab(tabIdx) {
      this.currentTabIdx = tabIdx
    },
    closeTab(tabIdx) {
      if (this.currentTabIdx === tabIdx) {
        if (this.currentTabIdx > 0) {
          this.currentTabIdx = tabIdx - 1
        } else {
          this.currentTabIdx = 0
        }
      } else if (this.currentTabIdx > tabIdx) {
        this.currentTabIdx = this.currentTabIdx - 1
      }
      this.tabs.splice(tabIdx, 1)
    },
    async fetchIndexList() {
      try {
        await this.$store.direct.dispatch.index.fetchIndexList()
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while fetching the indexes list.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    },
    // deleteSavedQuery(index) {
    /*
  delete:
    deleting tab is not opened
      just delete it

    deleting tab is opened
      deleting tab is actual opened tab
        - deleting tab is the only opened tab
        - deleting tab is the last of opened tabs
        - deleting tab is the first of opened tabs
        - else

      deleting tab is not actual opened tab
        - actual tab is last tab

*/
    // console.log(index)
    // const tabLength = this.tabs.length
    // if (tabLength === 1) {
    //   console.log('deleting only opened tab')
    //   this.currentTabIdx = -1
    // }
    // if (index === this.currentQueryIdx) {
    //   console.log('deleting current tab')
    //   if (this.currentTabIdx === tabLength - 1) {
    //     console.log('last tab')
    //     this.currentTabIdx = tabLength - 2
    //   } else {
    //     console.log('balec')
    //   }
    // } else {
    //   console.log('NOT deleting current tab')
    // }
    // this.savedQueries.splice(index, 1)
    // let storedQueries = JSON.parse(localStorage.getItem('savedQueries'))
    // if (!storedQueries) {
    //   storedQueries = {}
    // }
    // storedQueries[this.currentEnvironment] = this.savedQueries
    // localStorage.setItem('savedQueries', JSON.stringify(storedQueries))
    // this.$bvToast.toast(`Query successfully deleted.`, {
    //   title: 'Success',
    //   variant: 'success',
    //   toaster: 'b-toaster-bottom-right',
    //   appendToast: true
    // })
    // },
    // loadStoredQueries() {
    //   const storedQueries = localStorage.getItem('savedQueries')
    //   if (storedQuer      console.log(newTab, this.tabs);

    // resetFields() {
    //   this.currentQuery = `{
    //   "controller": "",
    //   "action": "",
    //   "index": "",
    //   "collection": "",
    //   "_id": "",
    //   "body": {}
    // }`
    //   this.$refs.queryEditorWrapper.setContent(this.currentQuery)
    //   this.currentQueryName = ''
    //   this.currentResponse = ''
    //   this.currentStatus = null
    //   this.currentQueryIndexName = null
    //   this.currentErrorStack = null
    // },
    // loadSavedQuery(index) {
    //   const query = this.savedQueries[index]
    //   if (!query) return

    //   const idx = this.tabs.findIndex(t => t.name === query.name)
    //   if (idx !== -1) {
    //     this.currentTabIdx = idx
    //     return
    //   }
    //   this.tabs.push(query)
    //   this.$nextTick(() => {
    //     const refName = `queryEditorWrapper-${query.name}`
    //     const ref = this.$refs[refName]
    //     ref[0].setContent(query.body)
    //   })
    //   this.currentTabIdx = this.tabs.length - 1
    // },
    // copyToClipBoard(type) {
    //   const textarea = document.createElement('textarea')
    //   if (type === 'Response') {
    //     textarea.value = this.currentResponse
    //   } else if (type === 'Query') {
    //     textarea.value = this.currentQuery
    //   }
    //   textarea.setAttribute('readonly', '')
    //   document.body.appendChild(textarea)
    //   textarea.select()
    //   try {
    //     document.execCommand('copy')
    //     this.$bvToast.toast(`${type} successfully copied.`, {
    //       title: 'Info',
    //       variant: 'info',
    //       toaster: 'b-toaster-bottom-right',
    //       appendToast: true
    //     })
    //   } catch (err) {
    //     this.$bvToast.toast(`Failed to copy ${type}.`, {
    //       title: 'Error',
    //       variant: 'danger',
    //       toaster: 'b-toaster-bottom-right',
    //       appendToast: true
    //     })
    //   }
    //   document.body.removeChild(textarea)
    // },
    // isQueryNameValid(name) {
    //   const nameSearch = this.savedQueries.find((q, index) => {
    //     if (this.currentQueryIndexName === index) {
    //       return false
    //     }
    //     return q.name === name
    //   })
    //   const nameAlreadyUsed = nameSearch !== undefined
    //   if (nameAlreadyUsed) {
    //     this.$bvToast.toast('Query name already used.', {
    //       title: 'Error',
    //       variant: 'danger',
    //       toaster: 'b-toaster-bottom-right',
    //       appendToast: true
    //     })
    //   }
    //   return !nameAlreadyUsed
    // },
    // queryNameValidated(name) {
    //   this.tabs[this.currentTabIdx].name = name
    //   this.tabs[this.currentTabIdx].saved = true
    //   this.savedQueries.push(this.tabs[this.currentTabIdx])
    //   let storedQueries = JSON.parse(localStorage.getItem('savedQueries'))
    //   if (!storedQueries) {
    //     storedQueries = {}
    //   }
    //   storedQueries[this.currentEnvironment.name] = this.savedQueries
    //   localStorage.setItem('savedQueries', JSON.stringify(storedQueries))
    //   this.$bvToast.toast('Query successfully saved.', {
    //     title: 'Info',
    //     variant: 'info',
    //     toaster: 'b-toaster-bottom-right',
    //     appendToast: true
    //   })
    // },
    // saveQuery() {
    //   if (this.currentQueryName === '') {
    //     return this.$bvModal.show('modal-save-query')
    //   } else {
    //     console.log('save query stored')
    //     const name = this.tabs[this.currentTabIdx].name
    //     const savedQueryIndex = this.savedQueries.findIndex(
    //       q => q.name === name
    //     )
    //     if (!savedQueryIndex) {
    //       this.$bvToast.toast('An error occured whiled saving query.', {
    //         title: 'Error',
    //         variant: 'danger',
    //         toaster: 'b-toaster-bottom-right',
    //         appendToast: true
    //       })
    //       return
    //     }
    //     const tabs = this.tabs;
    //     tabs[this.currentTabIdx].saved = true
    //     this.$set(this, 'tabs, tabs');
    //     this.savedQueries[savedQueryIndex] = this.tabs[this.currentTabIdx]
    //     let storedQueries = JSON.parse(localStorage.getItem('savedQueries'))
    //     if (!storedQueries) {
    //       storedQueries = {}
    //     }
    //     storedQueries[this.currentEnvironment.name] = this.savedQueries
    //     localStorage.setItem('savedQueries', JSON.stringify(storedQueries))
    //     this.$bvToast.toast('Query successfully saved.', {
    //       title: 'Info',
    //       variant: 'info',
    //       toaster: 'b-toaster-bottom-right',
    //       appendToast: true
    //     })
    //   }
    // },
    async performQuery(tabIdx) {
      const query = _.clone(this.tabs[tabIdx].query)
      let response = {}

      query.body = JSON.parse(query.body)
      try {
        response = await this.wrapper.query(query)
        this.$bvToast.toast('Query successfully played.', {
          title: 'Success',
          variant: 'success',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      } catch (error) {
        response = {
          ...error,
          message: error.message,
          stack: error.stack,
          kuzzleStack: error.kuzzleStack
        }
        this.$bvToast.toast('An error occured while playing query.', {
          title: 'Error',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      }
      this.tabs[tabIdx].response = response
    },
    newTab() {
      let newTab = _.clone(this.emptyTab)

      this.tabs.push(newTab)
      this.currentTabIdx = this.tabs.length - 1
    },
    async getKuzzlePublicApi() {
      try {
        const publicApi = await this.wrapper.query({
          controller: 'server',
          action: 'publicApi'
        })
        this.api = publicApi.result
      } catch (error) {
        this.$log.error(error)
      }
    }
  },
  watch: {
    currentQueryIndexName: {
      async handler(value) {
        if (!value) {
          return
        }
        if (this.storage.find(i => i.name === value && !i.collections)) {
          const index = this.$store.direct.getters.index.getOneIndex(value)
          await this.$store.direct.dispatch.index.fetchCollectionList(index)
        }
      },
      deep: true
    }
  },
  async mounted() {
    this.loading = true
    // this.loadStoredQueries()
    this.newTab()
    await this.getKuzzlePublicApi()
    await this.fetchIndexList()
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
::v-deep .card-title {
  margin-bottom: 0px;
}

.DataLayout {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.backgroundCard {
  background-color: $light-grey-color;
}

.DataLayout-sidebarWrapper {
  min-width: $sidebar-width;
  width: $sidebar-width;
  height: 100%;
  overflow: auto;
  z-index: 1;
}

.DataLayout-contentWrapper {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: $content-gutter;
}

.Custom-resizer > .multipane-resizer {
  margin: 0;
  left: 0;
  position: relative;
  padding: 3px;
  border: 1px solid #ccc;
  box-shadow: 2px 0px 5px -2px rgba(112, 112, 112, 1);
  &:before {
    display: block;
    content: '';
    width: 1px;
    height: 50px;
    position: absolute;
    top: 45%;
    left: 50%;
    border-left: 1px solid #aaa;
  }
  &:hover {
    &:before {
      border-color: #777;
      background-color: #f5f5f5;
    }
  }
}
</style>
