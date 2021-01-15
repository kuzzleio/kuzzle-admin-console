<template>
  <b-card-text :class="`mb-0`">
    <b-row class="my-3 px-3" align-h="between">
      <b-col cols="6">
        <b-row>
          <b-col>
            <b-form-group description="Controller" id="query-input-controller">
              <b-tooltip
                v-if="!isQueryValid(jsonQuery)"
                target="query-input-controller"
                placement="bottom"
              >
                The query is invalid.
              </b-tooltip>
              <b-form-input
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
                v-model="editedQuery.action"
                list="actionsList"
                :disabled="!isQueryValid(jsonQuery)"
              ></b-form-input>
            </b-form-group>
            <datalist id="actionsList">
              <option v-for="action of actions" :key="`${tabIdx}-${action}`">{{
                action
              }}</option>
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
          class="mr-3"
        >
          <i class="fas fa-rocket mr-2" />
          RUN
        </b-button>
        <b-button
          @click="saveQuery"
          :disabled="!isQueryValid(jsonQuery)"
          variant="outline-primary"
        >
          <i class="fas fa-save mr-2" />
          SAVE
        </b-button>
      </b-col>
    </b-row>
    <json-editor
      id="query"
      :ref="`queryEditorWrapper-${tabIdx}`"
      reference="queryEditor"
      tabindex="4"
      :content="jsonQuery"
      @change="queryBodyChange"
    />
  </b-card-text>
</template>

<script>
import jsonEditor from '@/components/Common/JsonEditor'

import _ from 'lodash'

export default {
  name: 'QueryCard',
  props: {
    query: {},
    tabIdx: {},
    controllers: {},
    actions: {},
    indexes: {},
    collections: {},
    api: {},
    openapi: {}
  },
  components: {
    jsonEditor
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
      let path = api.http[0].path
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
      for (let param of this.openapi[tmpPath][verb].parameters) {
        query[param.name] = null
      }
      this.jsonQuery = JSON.stringify(query, null, 2)
      this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery)
    },
    queryBodyChange($event) {
      this.jsonQuery = $event
      if (this.isQueryValid($event)) {
        const json = JSON.parse($event)
        if (json.controller !== this.editedQuery.controller) {
          this.editedQuery.controller = json.controller
        }
        if (json.action !== this.editedQuery.action) {
          this.editedQuery.action = json.action
        }
        if (json.index !== this.editedQuery.index) {
          this.editedQuery.index = json.index
        }
        if (json.collection !== this.editedQuery.collection) {
          this.editedQuery.collection = json.collection
        }
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

<style lang="scss" scoped></style>
