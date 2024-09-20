<template>
  <b-card-body class="px-0 py-0 h-100">
    <b-card-text :class="`mb-0 h-100`">
      <b-container fluid class="px-0 h-100">
        <b-row class="my-3 px-0" align-h="between">
          <b-col cols="8">
            <b-row>
              <b-col>
                <b-input-group id="query-input-controller" prepend="Controller" append="">
                  <b-tooltip
                    v-if="!isQueryValid(jsonQuery)"
                    target="query-input-controller"
                    placement="bottom"
                  >
                    The query is invalid.
                  </b-tooltip>
                  <b-form-input
                    v-model="editedQuery.controller"
                    :data-cy="`api-actions-controller-input-${tabIdx}`"
                    :disabled="!isQueryValid(jsonQuery)"
                    placeholder="Select or type your controller"
                    list="controllersList"
                  />
                  <b-input-group-append is-text @click="editedQuery.controller = ''">
                    <i class="fas fa-times" />
                  </b-input-group-append>
                </b-input-group>
                <datalist id="controllersList">
                  <option v-for="controller of controllers" :key="`${tabIdx}-${controller}`">
                    {{ controller }}
                  </option>
                </datalist>
              </b-col>
              <b-col>
                <b-input-group id="query-input-action" prepend="Action">
                  <b-tooltip
                    v-if="!isQueryValid(jsonQuery)"
                    target="query-input-action"
                    placement="bottom"
                  >
                    The query is invalid.
                  </b-tooltip>
                  <b-form-input
                    v-model="editedQuery.action"
                    :data-cy="`api-actions-action-input-${tabIdx}`"
                    list="actionsList"
                    placeholder="Select or type your action"
                    :disabled="!isQueryValid(jsonQuery)"
                  />
                  <b-input-group-append is-text @click="editedQuery.action = ''">
                    <i class="fas fa-times" />
                  </b-input-group-append>
                </b-input-group>
                <datalist id="actionsList">
                  <option v-for="action of actions" :key="`${tabIdx}-${action}`">
                    {{ action }}
                  </option>
                </datalist>
              </b-col>
              <b-button id="popover-target-1" variant="link">
                <i color="primary" class="fas fa-question-circle fa-lg" />
              </b-button>
              <b-popover target="popover-target-1" triggers="hover" placement="top">
                Here, you'll be able to perform custom
                <a href="https://docs.kuzzle.io/sdk/js/7/core-classes/kuzzle/query/" target="_blank"
                  >query
                  <i class="fa fa-external-link-alt" />
                </a>
                to Kuzzle following the
                <a href="https://docs.kuzzle.io/core/2/api/payloads/request/" target="_blank"
                  >API Documentation
                  <i class="fa fa-external-link-alt" />
                </a>
                .
              </b-popover>
            </b-row>
          </b-col>
          <b-col id="query-button-actions" class="text-right" cols="4">
            <b-tooltip
              v-if="!isQueryValid(jsonQuery)"
              target="query-button-actions"
              placement="bottom"
            >
              The query is invalid.
            </b-tooltip>

            <b-button
              :disabled="!isQueryValid(jsonQuery)"
              variant="success"
              :data-cy="`api-actions-run-button-${tabIdx}`"
              class="mr-3 pointer"
              @click="performQuery"
            >
              <i class="fas fa-rocket mr-2" />
              RUN
            </b-button>
            <b-button
              :disabled="!isQueryValid(jsonQuery)"
              :data-cy="`api-actions-save-button-${tabIdx}`"
              variant="outline-primary"
              class="pointer"
              @click="saveQuery"
            >
              <i class="fas fa-save mr-2" />
              SAVE
            </b-button>
          </b-col>
        </b-row>
        <b-row align-v="stretch" class="multipaneRow px-3">
          <Multipane class="QueryLayout-vertical Query-Custom-resizer-vertical" layout="vertical">
            <div class="QueryLayout-sidebarWrapper-vertical" data-cy="QueryLayout-sidebarWrapper">
              <b-card no-body class="h-100">
                <json-editor
                  :id="`queryEditorWrapper-${tabIdx}`"
                  :ref="`queryEditorWrapper-${tabIdx}`"
                  class="m-2 h-100"
                  :data-cy="`api-actions-query-JSONEditor-${tabIdx}`"
                  :content="jsonQuery"
                  @change="queryBodyChange"
                />
              </b-card>
            </div>
            <MultipaneResizer data-cy="sidebarResizer" />
            <div class="QueryLayout-contentWrapper-vertical">
              <ResponseCard :tab-idx="tabIdx" :response="response" />
            </div>
          </Multipane>
        </b-row>
      </b-container>
    </b-card-text>
  </b-card-body>
</template>

<script>
import _ from 'lodash';
import { Multipane, MultipaneResizer } from 'vue-multipane';

import ResponseCard from '@/components/ApiAction/ResponseCard.vue';
import jsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  name: 'QueryCard',
  components: {
    jsonEditor,
    ResponseCard,
    Multipane,
    MultipaneResizer,
  },
  props: {
    query: {},
    tabIdx: {},
    api: {},
    openapi: {},
    response: {},
  },
  data() {
    return {
      isFullScreen: false,
      jsonQuery: '{}',
      editedQuery: {
        controller: null,
        action: null,
        body: {},
      },
    };
  },
  computed: {
    controllers() {
      return this.api ? Object.keys(this.api) : [];
    },
    actions() {
      if (!this.api) {
        return [];
      }
      const currentController = this.editedQuery.controller;
      return currentController && this.api[currentController]
        ? Object.keys(this.api[currentController])
        : [];
    },
  },
  watch: {
    editedQuery: {
      deep: true,
      handler(value) {
        this.$emit('queryChanged', { query: value, tabIdx: this.tabIdx });
      },
    },
    'editedQuery.controller': {
      deep: true,
      handler(value) {
        const tmp = JSON.parse(this.jsonQuery);
        if (value !== tmp.controller) {
          tmp.controller = value;
          this.jsonQuery = JSON.stringify(tmp, null, 2);
          this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery);
        }
      },
    },
    'editedQuery.action': {
      deep: true,
      handler(value) {
        const tmp = JSON.parse(this.jsonQuery);
        if (value !== tmp.action) {
          tmp.action = value;
          this.jsonQuery = JSON.stringify(tmp, null, 2);
          this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery);
          this.loadQueryParams();
        }
      },
    },
  },
  mounted() {
    this.editedQuery = JSON.parse(JSON.stringify(this.query));
    this.jsonQuery = JSON.stringify(this.editedQuery, null, 2);
  },
  methods: {
    toggleFullscreen() {
      this.isFullScreen = !this.isFullScreen;
    },
    saveQuery() {
      this.$emit('saveQuery', this.tabIdx);
    },
    performQuery() {
      this.$emit('performQuery', this.tabIdx);
    },
    loadQueryParams() {
      const query = JSON.parse(JSON.stringify(this.editedQuery));
      const api = _.get(this.api, `${query.controller}.${query.action}`, null);
      if (!api) {
        const obj = {
          controller: query.controller,
          action: query.action,
          body: query.body,
        };
        this.jsonQuery = JSON.stringify(obj, null, 2);
        this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery);
        return;
      }
      const path = api.http[0].url;
      const verb = api.http[0].verb.toLowerCase();
      const openApiPath = path.replaceAll(/:[^,/]+/g, (m) => `{${m.replace(':', '')}}`);

      const params = _.get(this.openapi, `${openApiPath}.${verb}.parameters`, null);
      if (params) {
        for (const param of params) {
          query[param.name] = '';
        }
      }
      this.jsonQuery = JSON.stringify(query, null, 2);
      this.$refs[`queryEditorWrapper-${this.tabIdx}`].setContent(this.jsonQuery);
    },
    queryBodyChange($event) {
      this.jsonQuery = $event;
      if (this.isQueryValid($event)) {
        this.editedQuery = JSON.parse($event);
      }
    },
    isQueryValid(query) {
      if (!query) {
        return false;
      }
      try {
        JSON.parse(query);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};
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
  height: calc(100% - 50px);
}
</style>
