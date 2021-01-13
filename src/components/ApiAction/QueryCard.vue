<template>
  <b-card-text class="mb-0">
    <b-row class="my-3 px-3">
      <b-col>
        <b-form-input
          v-model="editedQuery.controller"
          placeholder="Controller"
          list="controllersList"
        ></b-form-input>
        <datalist id="controllersList">
          <option
            v-for="controller of controllers"
            :key="`${tabIdx}-${controller}`"
            >{{ controller }}</option
          >
        </datalist>
      </b-col>
      <b-col>
        <b-form-input
          v-model="editedQuery.action"
          placeholder="Action"
          list="actionsList"
        ></b-form-input>
        <datalist id="actionsList">
          <option v-for="action of actions" :key="`${tabIdx}-${action}`">{{
            action
          }}</option>
        </datalist>
      </b-col>
      <b-col>
        <b-form-input
          v-model="editedQuery.index"
          placeholder="Index"
          list="indexList"
        ></b-form-input>
        <datalist id="indexList">
          <option v-for="i of indexes" :key="`${tabIdx}-${i}`">{{ i }}</option>
        </datalist>
      </b-col>
      <b-col>
        <b-form-input
          v-model="editedQuery.collection"
          placeholder="Collection"
          list="collectionList"
        ></b-form-input>
        <datalist id="collectionList">
          <option
            v-for="collection of collections"
            :key="`${tabIdx}-${collection}`"
            >{{ collection }}</option
          >
        </datalist>
      </b-col>
      <b-col class="text-right">
        <b-button
          @click="performQuery"
          :disabled="!isQueryValid"
          variant="success"
          class="mr-3"
        >
          <i class="fas fa-rocket mr-2" />
          RUN
        </b-button>
        <!-- <b-button
                          @click="saveQuery(tabIdx)"
                          :disabled="!isQueryValid"
                          variant="outline-primary"
                        >
                          <i class="fas fa-save mr-2" />
                          SAVE
                        </b-button> -->
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
      :ref="`queryEditorWrapper-${tabIdx}`"
      reference="queryEditor"
      tabindex="4"
      myclass="h-100"
      :height="300"
      :content="editedQuery.body"
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
    collections: {}
  },
  components: {
    jsonEditor
  },
  data() {
    return {
      editedQuery: {
        controller: null,
        action: null,
        _id: null,
        index: null,
        collection: null,
        body: '{}'
      }
    }
  },
  mounted() {
    this.editedQuery = _.clone(this.query)
  },
  methods: {
    performQuery() {
      this.$emit('perfomQuery', this.tabIdx)
    },
    queryBodyChange($event) {
      this.editedQuery.body = $event
    },
    isQueryValid() {
      if (!this.editedQuery.body) {
        return false
      }
      try {
        JSON.parse(this.editedQuery.body)
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
        this.$emit('queryChanged', {query: value, tabIdx: this.tabIdx})
      }
    }
  }
}
</script>

<style></style>
