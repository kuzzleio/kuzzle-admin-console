<template>
  <Multipane class="DataLayout Custom-resizer" layout="vertical">
    <div class="DataLayout-sidebarWrapper" data-cy="DataLayout-sidebarWrapper">
      <QueryList
        :savedQueries="savedQueries"
        :currentQueryName="currentQueryName"
        @deleteSavedQuery="deleteSavedQuery"
        @loadSavedQuery="loadSavedQuery"
      />
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
                  v-for="(query, queryIndex) of tabs"
                  :key="`query-${queryIndex}-${query.name}`"
                  class="p-0"
                  :active="currentTab === queryIndex"
                  @click.prevent=""
                >
                  <template #title>
                    <strong @click="currentTab = queryIndex"
                      >{{ query.name ? query.name : 'New query' }}
                      {{ queryHasChangesNotSaved(queryIndex) ? ' *' : '' }}
                    </strong>
                    <i
                      class="fas fa-times ml-5"
                      @click="closeTab(queryIndex)"
                    />
                  </template>
                  <b-card-text class="mb-0">
                    <b-row class="my-3 px-3">
                      <b-col>
                        <b-form-input
                          v-model="query.controller"
                          placeholder="Controller"
                          list="controllersList"
                        ></b-form-input>
                        <datalist id="controllersList">
                          <option
                            v-for="controller of controllers"
                            :key="`${queryIndex}-${controller}`"
                            >{{ controller }}</option
                          >
                        </datalist>
                      </b-col>
                      <b-col>
                        <b-form-input
                          v-model="query.action"
                          placeholder="Action"
                          list="actionsList"
                        ></b-form-input>
                        <datalist id="actionsList">
                          <option
                            v-for="action of actions"
                            :key="`${queryIndex}-${action}`"
                            >{{ action }}</option
                          >
                        </datalist>
                      </b-col>
                      <b-col>
                        <b-form-input
                          v-model="query.index"
                          placeholder="Index"
                          list="indexList"
                        ></b-form-input>
                        <datalist id="indexList">
                          <option
                            v-for="i of indexes"
                            :key="`${queryIndex}-${i}`"
                            >{{ i }}</option
                          >
                        </datalist>
                      </b-col>
                      <b-col>
                        <b-form-input
                          v-model="query.collection"
                          placeholder="Collection"
                          list="collectionList"
                        ></b-form-input>
                        <datalist id="collectionList">
                          <option
                            v-for="collection of collections"
                            :key="`${queryIndex}-${collection}`"
                            >{{ collection }}</option
                          >
                        </datalist>
                      </b-col>
                      <b-col class="text-right">
                        <b-button
                          @click="performQuery(queryIndex)"
                          :disabled="!isQueryValid"
                          variant="success"
                          class="mr-3"
                        >
                          <i class="fas fa-rocket mr-2" />
                          RUN
                        </b-button>
                        <b-button
                          @click="saveQuery(queryIndex)"
                          :disabled="!isQueryValid"
                          variant="outline-primary"
                        >
                          <i class="fas fa-save mr-2" />
                          SAVE
                        </b-button>
                        <!-- <b-button
                          @click="copyToClipBoard('Query')"
                          variant="outline-secondary"
                        >
                          <i class="fas fa-copy mr-2" />
                          COPY
                        </b-button> -->
                      </b-col>
                    </b-row>
                    <json-editor
                      id="query"
                      :ref="`queryEditorWrapper-${query.name}`"
                      reference="queryEditor"
                      tabindex="4"
                      myclass="h-100"
                      :height="300"
                      :content="query.body"
                      @change="queryBodyChange($event, queryIndex)"
                    />
                  </b-card-text>
                  <ResponseCard :response="query.response" />
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
    <SaveQueryModal
      :isQueryNameValid="isQueryNameValid"
      @queryNameValidated="queryNameValidated"
    />
  </Multipane>
</template>

<script>
import jsonEditor from '@/components/Common/JsonEditor'
import InfoAlert from '@/components/ApiAction/InfoAlert'
import ResponseCard from '@/components/ApiAction/ResponseCard'
import SaveQueryModal from '@/components/ApiAction/SaveQueryModal'
import QueryList from '@/components/ApiAction/QueryList'

import { Multipane, MultipaneResizer } from 'vue-multipane'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  components: {
    Multipane,
    jsonEditor,
    MultipaneResizer,
    ResponseCard,
    InfoAlert,
    SaveQueryModal,
    QueryList
  },
  data() {
    return {
      tabs: [],
      currentTab: 0,
      api: null,
      loading: true,
      savedQueries: []
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper', 'currentEnvironment']),
    storage() {
      return this.$store.direct.getters.index.indexes
    },
    indexes() {
      return this.storage.map(i => i.name)
    },
    collections() {
      if (!this.currentQueryIndex) {
        return []
      }
      const index = this.storage.find(i => i.name === this.currentQueryIndex)
      return index && index.collections
        ? index.collections.map(c => c.name)
        : []
    },
    controllers() {
      return this.api ? Object.keys(this.api) : []
    },
    actions() {
      if (!this.tabs[this.currentTab]) {
        return []
      }
      const currentController = this.tabs[this.currentTab].controller
      return currentController && this.api[currentController]
        ? Object.keys(this.api[currentController])
        : []
    },
    currentQueryIndex() {
      if (!this.tabs[this.currentTab]) {
        return null
      }
      return this.tabs[this.currentTab].index
    },
    currentQueryBody() {
      if (!this.tabs[this.currentTab]) {
        return null
      }
      return this.tabs[this.currentTab].body
    },
    currentQueryName() {
      if (!this.tabs[this.currentTab]) {
        return null
      }
      return this.tabs[this.currentTab].name
    },
    isQueryValid() {
      if (!this.currentQueryBody) {
        return false
      }
      try {
        JSON.parse(this.currentQueryBody)
        return true
      } catch (error) {
        return false
      }
    }
  },
  methods: {
    queryHasChangesNotSaved(index) {
      const savedQuery = this.savedQueries.find(
        q => q.name === this.currentQueryName
      )
      return !_.isEqual(savedQuery, this.tabs[index])
    },
    closeTab(index) {
      if (this.currentTab === index) {
        if (this.currentTab > 0) {
          this.currentTab = index - 1
        } else {
          this.currentTab = 0
        }
      } else if (this.currentTab > index) {
        this.currentTab = this.currentTab - 1
      }
      console.log(this.currentTab)
      this.tabs.splice(index, 1)
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
    deleteSavedQuery(index) {
      console.log(index)
      // if (index === this.currentQueryIndex) {
      //   this.resetFields()
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
    },
    loadStoredQueries() {
      const storedQueries = localStorage.getItem('savedQueries')
      if (storedQueries) {
        this.savedQueries = JSON.parse(storedQueries)[
          this.currentEnvironment.name
        ]
      }
    },
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
    //   this.currentQueryIndex = null
    //   this.currentErrorStack = null
    // },
    loadSavedQuery(index) {
      const query = this.savedQueries[index]
      if (!query) return

      const idx = this.tabs.findIndex(t => t.name === query.name)
      if (idx !== -1) {
        this.currentTab = idx
        return
      }
      this.tabs.push(query)
      this.$refs[`queryEditorWrapper-${query.name}`].setContent(JSON.parse(query.body))
      this.currentTab = this.tabs.length - 1
    },
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
    isQueryNameValid(name) {
      const nameSearch = this.savedQueries.find((q, index) => {
        if (this.currentQueryIndex === index) {
          return false
        }
        return q.name === name
      })
      const nameAlreadyUsed = nameSearch !== undefined
      if (nameAlreadyUsed) {
        this.$bvToast.toast('Query name already used.', {
          title: 'Error',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      }
      return !nameAlreadyUsed
    },
    queryNameValidated(name) {
      const oldName = this.tabs[this.currentTab].name
      this.tabs[this.currentTab].name = name
      if (oldName === '') {
        this.savedQueries.push(this.tabs[this.currentTab])
      } else {
        const savedQueryIndex = this.savedQueries.findIndex(
          q => q.name === oldName
        )
        if (!savedQueryIndex) {
          this.$bvToast.toast('An error occured whiled saving query.', {
            title: 'Error',
            variant: 'danger',
            toaster: 'b-toaster-bottom-right',
            appendToast: true
          })
          return
        }
        this.savedQueries[savedQueryIndex] = this.tabs[this.currentTab]
      }
      let storedQueries = JSON.parse(localStorage.getItem('savedQueries'))
      if (!storedQueries) {
        storedQueries = {}
      }
      storedQueries[this.currentEnvironment.name] = this.savedQueries
      localStorage.setItem('savedQueries', JSON.stringify(storedQueries))
      this.$bvToast.toast('Query successfully saved.', {
        title: 'Info',
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
        appendToast: true
      })
    },
    saveQuery() {
      if (this.currentQueryName === "") {
        return this.$bvModal.show('modal-save-query')
      }

    },
    async performQuery(index) {
      const tab = this.tabs[index]
      const query = {
        body: JSON.parse(tab.body),
        _id: tab._id,
        controller: tab.controller,
        action: tab.action,
        index: tab.index,
        collection: tab.collection
      }
      let response
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
      this.tabs[index].response = response
    },
    queryBodyChange(payload, index) {
      this.tabs[index].body = payload
    },
    newTab() {
      this.tabs.push({
        body: '{}',
        _id: null,
        controller: null,
        action: null,
        index: null,
        collection: null,
        name: '',
        response: ''
      })
      this.currentTab = this.tabs.length - 1
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
    currentQueryIndex: {
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
    this.loadStoredQueries()
    this.tabs.push({
      body: '{}',
      _id: null,
      controller: null,
      action: null,
      index: null,
      collection: null,
      name: '',
      response: ''
    })
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
