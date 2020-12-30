<template>
  <Multipane class="DataLayout Custom-resizer" layout="vertical">
    <div class="DataLayout-sidebarWrapper" data-cy="DataLayout-sidebarWrapper">
      <b-row class="h-100 text-center mx-0" align-v="center" align-h="center">
        <b-col cols="12" class="h-100 px-0">
          <b-card class="h-100 backgroundCard" no-body>
            <b-card-body class="d-flex flex-column text-center m-0 p-0">
              <b-row class="mx-0">
                <b-col class="my-3">
                  <b-button @click="resetFields" variant="primary">
                    <i class="fas fa-plus mr-2" />
                    New Query
                  </b-button>
                </b-col>
              </b-row>
              <b-card-text class="px-1">
                <b-list-group>
                  <b-list-group-item
                    v-for="query of paginedQueries"
                    class="d-flex justify-content-between align-items-center"
                    :key="`saved-query-${query.idx}`"
                    :active="query.idx === currentQueryIndex"
                  >
                    <span @click="loadSavedQuery(query.idx)">{{
                      query.name
                    }}</span>
                    <i
                      :class="`fas fa-trash`"
                      @click="deleteSavedQuery(query.idx)"
                    />
                  </b-list-group-item>
                </b-list-group>
              </b-card-text>
              <b-row class="mt-auto mx-0" align-h="center">
                <b-pagination
                  v-model="currentPage"
                  :total-rows="savedQueries.length"
                  :per-page="queryPerPage"
                  aria-controls="my-table"
                ></b-pagination>
              </b-row>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper">
      <b-container fluid class="queryContainer">
        <b-row align-v="stretch">
          <b-col cols="12">
            <b-alert show variant="info">
              Here, you'll be able to perform custom
              <a
                href="https://docs.kuzzle.io/sdk/js/7/core-classes/kuzzle/query/"
                target="_blank"
                >query
                <i class="fa fa-external-link-alt" />
              </a>
              to Kuzzle following the
              <a
                href="https://docs.kuzzle.io/core/2/api/payloads/request/"
                target="_blank"
                >API Documentation
                <i class="fa fa-external-link-alt" />
              </a>
              .
            </b-alert>
          </b-col>
          <b-col cols="7">
            <b-card no-body>
              <b-card-header>
                <b-card-title >
                  Query
                </b-card-title>
              </b-card-header>
              <b-card-text v-if="!loading" class="mb-0">
                <b-row class="m-3">
                  <b-form-input
                    placeholder="Query name"
                    v-model="currentQueryName"
                  ></b-form-input>
                </b-row>
                <json-editor
                  id="query"
                  ref="queryEditorWrapper"
                  reference="queryEditor"
                  tabindex="4"
                  myclass="h-100"
                  :height="600"
                  :content="currentQuery"
                  @change="jsonQueryChanged"
                />
              </b-card-text>
              <b-card-footer>
                <b-row>
                  <b-col class="text-left">
                    <b-button
                      @click="performQuery"
                      :disabled="!isQueryValid"
                      variant="success"
                    >
                      <i class="fas fa-rocket mr-2" />
                      RUN
                    </b-button>
                  </b-col>
                  <b-col class="text-right">
                    <b-button
                      @click="saveCurrentQuery"
                      :disabled="!isQueryValid"
                      variant="outline-primary"
                      class="mr-3"
                    >
                      <i class="fas fa-save mr-2" />
                      SAVE
                    </b-button>

                    <b-button
                      @click="copyToClipBoard('Query')"
                      variant="outline-secondary"
                    >
                      <i class="fas fa-copy mr-2" />
                      COPY
                    </b-button>
                  </b-col>
                </b-row>
              </b-card-footer>
            </b-card>
          </b-col>
          <b-col cols="5">
            <b-card no-body class="h-100">
              <b-card-header>
                <b-card-title>
                  Response
                </b-card-title>
              </b-card-header>
              <b-card-body class="p-0" v-if="!loading">
                <b-row class="m-2" no-gutters>
                  <b-col cols="12">
                    <b-alert show :variant="statusBarVariant" class="mb-0">
                      Status: {{ currentStatus }}
                    </b-alert>
                  </b-col>
                </b-row>
                <json-editor
                  id="response"
                  ref="responseEditorWrapper"
                  reference="responseEditor"
                  tabindex="4"
                  :height="603"
                  readonly
                  :content="currentResponse"
                />
              </b-card-body>
              <b-card-footer class="text-right">
                <b-button
                  @click="copyToClipBoard('Response')"
                  variant="outline-secondary"
                >
                  <i class="fas fa-copy mr-2" />
                  COPY
                </b-button>
              </b-card-footer>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </Multipane>
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane'
import jsonEditor from '@/components/Common/JsonEditor'
import { mapGetters } from 'vuex'

export default {
  components: {
    Multipane,
    jsonEditor,
    MultipaneResizer
  },
  data() {
    return {
      currentQuery: '{}',
      currentQueryName: '',
      currentResponse: '',
      currentStatus: null,
      savedQueries: [],
      loading: true,
      currentQueryIndex: null,
      queryPerPage: 10,
      currentPage: 1
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper', 'currentEnvironment']),
    paginedQueries() {
      return this.savedQueries
        .map((q, index) => {
          q.idx = index
          return q
        })
        .filter(q => {
          return (
            q.idx >= this.currentPage * this.queryPerPage - this.queryPerPage &&
            q.idx < this.currentPage * this.queryPerPage
          )
        })
    },
    statusBarVariant() {
      if (this.currentStatus === null) return 'secondary'
      if (this.currentStatus.toString().match(/20[0-9]/)) return 'success'
      return 'danger'
    },
    isQueryValid() {
      if (!this.currentQuery) {
        return false
      }
      try {
        JSON.parse(this.currentQuery)
        return true
      } catch (error) {
        return false
      }
    }
  },
  methods: {
    copyToClipBoard(type) {
      const textarea = document.createElement('textarea')
      if (type === 'Response') {
        textarea.value = this.currentResponse
      } else if (type === 'Query') {
        textarea.value = this.currentQuery
      }
      textarea.setAttribute('readonly', '')
      document.body.appendChild(textarea)

      textarea.select()
      try {
        document.execCommand('copy')
        this.$bvToast.toast(`${type} successfully copied.`, {
          title: 'Success',
          variant: 'success',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      } catch (err) {
        this.$bvToast.toast(`Failed to copy ${type}.`, {
          title: 'Error',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      }
      document.body.removeChild(textarea)
    },
    isQueryNameValid() {
      if (!this.currentQueryName) {
        this.$bvToast.toast('Empty query name.', {
          title: 'Error',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
        return false
      }
      const nameSearch = this.savedQueries.find((q, index) => {
        if (this.currentQueryIndex === index) {
          return false
        }
        return q.name === this.currentQueryName
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
    loadStoredQueries() {
      const storedQueries = localStorage.getItem('savedQueries')
      if (storedQueries) {
        this.savedQueries = JSON.parse(storedQueries)[this.currentEnvironment]
      }
    },
    saveCurrentQuery() {
      if (!this.isQueryValid) {
        this.$bvToast.toast('Invalid query.', {
          title: 'Error',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      }
      if (!this.isQueryNameValid()) {
        return
      }

      const query = {
        name: this.currentQueryName,
        query: JSON.stringify(this.currentQuery, null, ' ')
      }

      if (this.currentQueryIndex === null) {
        this.savedQueries.push(query)
      } else {
        //todo use lodash
        let tmpSavedQueries = JSON.parse(JSON.stringify(this.savedQueries))
        tmpSavedQueries[this.currentQueryIndex] = query
        this.$set(this, 'savedQueries', tmpSavedQueries)
      }
      let storedQueries = JSON.parse(localStorage.getItem('savedQueries'))
      if (!storedQueries) {
        storedQueries = {}
      }
      storedQueries[this.currentEnvironment] = this.savedQueries
      localStorage.setItem('savedQueries', JSON.stringify(storedQueries))
      this.$bvToast.toast('Query successfully saved.', {
        title: 'Success',
        variant: 'success',
        toaster: 'b-toaster-bottom-right',
        appendToast: true
      })
    },
    deleteSavedQuery(index) {
      //todo toast confirm
      if (index === this.currentQueryIndex) {
        this.resetFields()
      }
      this.savedQueries.splice(index, 1)
      let storedQueries = JSON.parse(localStorage.getItem('savedQueries'))
      if (!storedQueries) {
        storedQueries = {}
      }
      storedQueries[this.currentEnvironment] = this.savedQueries
      localStorage.setItem('savedQueries', JSON.stringify(storedQueries))
      this.$bvToast.toast(`Query successfully deleted.`, {
        title: 'Success',
        variant: 'success',
        toaster: 'b-toaster-bottom-right',
        appendToast: true
      })
    },
    async performQuery() {
      const response = await this.wrapper.query(JSON.parse(this.currentQuery))
      this.currentResponse = JSON.stringify(response, null, ' ')
      this.currentStatus = response.status
      this.$refs.responseEditorWrapper.setContent(this.currentResponse)
      if (this.statusBarVariant === 'danger') {
        this.$bvToast.toast('An error occured while playing query.', {
          title: 'Error',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      } else {
        this.$bvToast.toast('Query successfully played.', {
          title: 'Success',
          variant: 'success',
          toaster: 'b-toaster-bottom-right',
          appendToast: true
        })
      }
    },
    jsonQueryChanged(val) {
      this.currentQuery = val
    },
    resetFields() {
      this.currentQuery = `{
  "controller": "",
  "action": "",
  "index": "",
  "collection": "",
  "_id": "",
  "body": {}
}`
      this.$refs.queryEditorWrapper.setContent(this.currentQuery)
      this.currentQueryName = ''
      this.currentResponse = ''
      this.currentStatus = null
      this.currentQueryIndex = null
    },
    loadSavedQuery(index) {
      this.currentQueryIndex = index
      this.currentQuery = this.savedQueries[index].query
      this.$refs.queryEditorWrapper.setContent(JSON.parse(this.currentQuery))
      this.currentQueryName = this.savedQueries[index].name
    }
  },
  mounted() {
    this.loading = true
    this.loadStoredQueries()
    this.currentQuery = `{
  "controller": "",
  "action": "",
  "index": "",
  "collection": "",
  "_id": "",
  "body": {}
}`
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
