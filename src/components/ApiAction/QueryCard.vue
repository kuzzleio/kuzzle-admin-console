<template>
  <b-card-body class="h-100">
    <b-card-text :class="`mb-0 h-100`">
      <b-container fluid class="h-100">
        <b-row class="my-3 px-3" align-h="between">
          <b-col cols="6">
            <b-row>
              <b-col>
                <b-form-group
                  description="Controller"
                  id="query-input-controller"
                >
                  <b-tooltip
                    v-if="!isQueryValid(jsonQuery)"
                    target="query-input-controller"
                    placement="bottom"
                  >
                    The query is invalid.
                  </b-tooltip>
                  <b-form-input
                    :data-cy="`api-actions-controller-input-${tabIdx}`"
                    v-model="editedQuery.controller"
                    :disabled="!isQueryValid(jsonQuery)"
                    list="controllersList"
                  ></b-form-input>
                </b-form-group>
                <datalist id="controllersList">
                  <option
                    v-for="controller of controllers"
                    :key="`${tabIdx}-${controller}`"
                    >{{ controller }}</option
                  >
                </datalist>
              </b-col>
              <b-col>
                <b-form-group description="Action" id="query-input-action">
                  <b-tooltip
                    v-if="!isQueryValid(jsonQuery)"
                    target="query-input-action"
                    placement="bottom"
                  >
                    The query is invalid.
                  </b-tooltip>
                  <b-form-input
                    :data-cy="`api-actions-action-input-${tabIdx}`"
                    v-model="editedQuery.action"
                    list="actionsList"
                    :disabled="!isQueryValid(jsonQuery)"
                  ></b-form-input>
                </b-form-group>
                <datalist id="actionsList">
                  <option
                    v-for="action of actions"
                    :key="`${tabIdx}-${action}`"
                    >{{ action }}</option
                  >
                </datalist>
              </b-col>
            </b-row>
          </b-col>
          <b-col class="text-right" id="query-button-actions" cols="2">
            <b-tooltip
              v-if="!isQueryValid(jsonQuery)"
              target="query-button-actions"
              placement="bottom"
            >
              The query is invalid.
            </b-tooltip>

            <b-button
              @click="performQuery"
              :disabled="!isQueryValid(jsonQuery)"
              variant="success"
              :data-cy="`api-actions-run-button-${tabIdx}`"
              class="mr-3"
            >
              <i class="fas fa-rocket mr-2" />
              RUN
            </b-button>
            <b-button
              @click="saveQuery"
              :disabled="!isQueryValid(jsonQuery)"
              :data-cy="`api-actions-save-button-${tabIdx}`"
              variant="outline-primary"
            >
              <i class="fas fa-save mr-2" />
              SAVE
            </b-button>
          </b-col>
        </b-row>
        <b-row align-v="stretch" class="multipaneRow">
          <Multipane
            class="QueryLayout-vertical Query-Custom-resizer-vertical"
            layout="vertical"
          >
            <div
              class="QueryLayout-sidebarWrapper-vertical"
              data-cy="QueryLayout-sidebarWrapper"
            >
              <b-card no-body class="h-100">
                <json-editor
                  id="query"
                  :ref="`queryEditorWrapper-${tabIdx}`"
                  reference="queryEditor"
                  tabindex="4"
                  class="m-2 h-100"
                  :data-cy="`api-actions-query-JSONEditor-${tabIdx}`"
                  :content="jsonQuery"
                  @change="queryBodyChange"
                />
              </b-card>
            </div>
            <MultipaneResizer data-cy="sidebarResizer" />
            <div class="QueryLayout-contentWrapper-vertical">
              <ResponseCard :tabIdx="tabIdx" :response="response" />
            </div>
          </Multipane>
        </b-row>
      </b-container>
    </b-card-text>
  </b-card-body>
</template>

<script>
import jsonEditor from '@/components/Common/JsonEditor'
import ResponseCard from '@/components/ApiAction/ResponseCard'
import { Multipane, MultipaneResizer } from 'vue-multipane'
import _ from 'lodash'

export default {
  name: 'QueryCard',
  props: {
    query: {},
    tabIdx: {},
    controllers: {},
    actions: {},
    api: {},
    openapi: {},
    response: {}
  },
  components: {
    jsonEditor,
    ResponseCard,
    Multipane,
    MultipaneResizer
  },
  data() {
    return {
      isFullScreen: false,
      jsonQuery: '{}',
      editedQuery: {
        controller: null,
        action: null,
        body: {}
      }
    }
  },
  mounted() {
    this.editedQuery = _.clone(this.query)
    this.jsonQuery = JSON.stringify(this.editedQuery, null, 2)
  },
  methods: {
    toggleFullscreen() {
      this.isFullScreen = !this.isFullScreen
    },
    saveQuery() {
      this.$emit('saveQuery', this.tabIdx)
    },
    performQuery() {
      this.$emit('performQuery', this.tabIdx)
    },
    loadQueryParams() {
      const query = _.clone(this.editedQuery)
      if (
        !this.api ||
        !this.api[query.controller] ||
        !this.api[query.controller][query.action]
      ) {
        let obj = {
          controller: query.controller,
          action: query.action,
          body: query.body
        }
        this.jsonQuery = JSON.stringify(obj, null, 2)

        this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(
          this.jsonQuery
        )
        return
      }
      const api = this.api[query.controller][query.action]
      let path = api.http[0].url
      let verb = api.http[0].verb.toLowerCase()
      let tmpPath = path
      let idx = tmpPath.search(/\/:/)
      while (idx !== -1) {
        tmpPath = tmpPath.replace('/:', '/{')
        let sub = tmpPath.substring(idx + 1, tmpPath.length)
        if (sub.search(/\//) !== -1) {
          let newSub = sub.replace('/', '}/')
          tmpPath = tmpPath.replace(sub, newSub)
        } else {
          tmpPath += '}'
        }
        idx = tmpPath.search(/\/:/)
      }
      if (
        this.openapi &&
        this.openapi[tmpPath] &&
        this.openapi[tmpPath][verb] &&
        this.openapi[tmpPath][verb].parameters
      ) {
        for (let param of this.openapi[tmpPath][verb].parameters) {
          query[param.name] = null
        }
      }
      this.jsonQuery = JSON.stringify(query, null, 2)
      this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery)
    },
    queryBodyChange($event) {
      this.jsonQuery = $event
      if (this.isQueryValid($event)) {
        this.editedQuery = JSON.parse($event)
      }
    },
    isQueryValid(query) {
      if (!query) {
        return false
      }
      try {
        JSON.parse(query)
        return true
      } catch (error) {
        return false
      }
    }
  },
  watch: {
    editedQuery: {
      deep: true,
      handler(value) {
        this.$emit('queryChanged', { query: value, tabIdx: this.tabIdx })
      }
    },
    'editedQuery.controller': {
      deep: true,
      handler(value) {
        const tmp = JSON.parse(this.jsonQuery)
        if (value !== tmp.controller) {
          tmp.controller = value
          this.jsonQuery = JSON.stringify(tmp, null, 2)
          this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(
            this.jsonQuery
          )
        }
      }
    },
    'editedQuery.action': {
      deep: true,
      handler(value) {
        const tmp = JSON.parse(this.jsonQuery)
        if (value !== tmp.action) {
          tmp.action = value
          this.jsonQuery = JSON.stringify(tmp, null, 2)
          this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(
            this.jsonQuery
          )
          this.loadQueryParams()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.QueryLayout-vertical {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.QueryLayout-sidebarWrapper-vertical {
  min-width: 300px;
  width: 1000px;
  height: 100%;
  z-index: 1;
}

.QueryLayout-contentWrapper-vertical {
  flex-grow: 1;
  height: 100%;
  min-width: 300px;
  overflow: auto;
}

.Query-Custom-resizer-vertical > .multipane-resizer {
  margin: 0;
  left: 0;
  height: 100%;
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
    top: 50%;
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
.multipaneRow {
  height: calc(100% - 100px);
}
</style>
