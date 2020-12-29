<template>
  <Multipane class="DataLayout Custom-resizer" layout="vertical">
    <div class="DataLayout-sidebarWrapper" data-cy="DataLayout-sidebarWrapper">
      <b-button @click="resetFields">
        New Query
      </b-button>
      <b-button @click="importQuery">
        Import Query
      </b-button>
      <b-list-group>
        <b-list-group-item
          v-for="(query, index) of savedQueries"
          class="d-flex justify-content-between align-items-center"
          :key="`saved-query-${index}`"
          :active="index === currentQueryIndex"
        >
          <span @click="loadSavedQuery(index)">{{ query.name }}</span>
          <i :class="`fas fa-trash`" @click="deleteSavedQuery(index)" />
        </b-list-group-item>
      </b-list-group>
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper">
      <b-container fluid class="queryContainer">
        <b-row>
          <b-col cols="7">
            <b-card no-body>
              <b-card-header>
                <b-card-title>
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
                  :height="650"
                  :content="currentQuery"
                  @change="jsonQueryChanged"
                />
              </b-card-text>
              <b-card-footer>
                <b-button @click="saveCurrentQuery" :disabled="!isQueryValid">
                  SAVE
                </b-button>
                <b-button @click="performQuery" :disabled="!isQueryValid">
                  RUN
                </b-button>
                <b-button @click="exportQuery" :disabled="!isQueryValid">
                  EXPORT
                </b-button>
                <b-button @click="copyQuery">
                  COPY
                </b-button>
              </b-card-footer>
            </b-card>
          </b-col>
          <b-col cols="5">
            <b-card no-body>
              <b-card-header>
                <b-card-title>
                  Response
                </b-card-title>
              </b-card-header>
              <b-card-text v-if="!loading" class="mb-0">
                <b-row class="m-3"> Status: {{ currentStatus }} </b-row>
                <json-editor
                  id="response"
                  ref="responseEditorWrapper"
                  reference="responseEditor"
                  tabindex="4"
                  myclass="h-100"
                  readonly
                  :height="650"
                  :content="currentResponse"
                />
              </b-card-text>
              <b-card-footer>
                <b-button @click="exportResponse">
                  EXPORT
                </b-button>
                <b-button @click="copyResponse">
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
      currentQueryIndex: null
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper', 'currentEnvironment']),
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
    copyQuery() {},
    exportResponse() {},
    copyResponse() {},
    isQueryNameValid() {
      if (!this.currentQueryName) {
        console.error('empty name')
        //todo toast error empty name
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
        console.error('name already used')
        // todo error toast name already used
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
        console.error('invalid query')
        //todo error toast i[${this.currentQueryIndex}]
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
    },
    async performQuery() {
      try {
        const response = await this.wrapper.query(JSON.parse(this.currentQuery))
        console.log(response)
        this.currentResponse = JSON.stringify(response, null, ' ')
        this.currentStatus = response.status
        this.$refs.responseEditorWrapper.setContent(this.currentResponse)
        //toast here
      } catch (error) {
        console.log(error)
        // display toast here
        // display error in response
      }
    },
    jsonQueryChanged(val) {
      this.currentQuery = val
    },
    importQuery() {},
    exportQuery() {},
    resetFields() {
      this.currentQuery = '{}'
      this.$refs.queryEditorWrapper.setContent('{}')
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
    this.currentQuery = `
{
  "controller": "document",
  "action": "create",
  "index": "nyc-open-data",
  "collection": "yellow-taxi",
  "_id": "my-custom-document-id",
  "refresh": "wait_for",
  "body": {
    "trip_distance": 4.23,
    "passenger_count": 2
  }
}`
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
.DataLayout {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
.DataLayout-sidebarWrapper {
  background-color: $light-grey-color;
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
