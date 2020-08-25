<template>
  <Multipane class="DataLayout Custom-resizer" layout="vertical">
    <div class="DataLayout-sidebarWrapper" data-cy="DataLayout-sidebarWrapper">
      <b-button>
        New Query
      </b-button>
      <b-list-group>
        <b-list-group-item>query1</b-list-group-item>
        <b-list-group-item>query2</b-list-group-item>
        <b-list-group-item>query3</b-list-group-item>
        <b-list-group-item>query4</b-list-group-item>
        <b-list-group-item>query5</b-list-group-item>
      </b-list-group>
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper">
      <b-container fluid class="queryContainer">
        <b-row>
          <b-col cols="7">
            <b-card>
              <b-card-title>
                <b-form-input placeholder="Query name"></b-form-input>
              </b-card-title>
              <b-card-text>
                <json-editor
                  id="query"
                  ref="jsoneditor"
                  tabindex="4"
                  myclass="h-100"
                  height="500"
                  :content="
                    `
{
  controller: 'document',
  action: 'create',
  index: 'nyc-open-data',
  collection: 'yellow-taxi',
  _id: 'my-custom-document-id',
  refresh: 'wait_for', // Additional property allowed for this API action
  body: {
    trip_distance: 4.23,
    passenger_count: 2
  }
}`
                  "
                  @change="console.log('lol')"
                />
              </b-card-text>
                <b-card-actions>
                <b-button>
                  SAVE
                </b-button>
                <b-button>
                  RUN
                </b-button>
              </b-card-actions>
            </b-card>
          </b-col>
          <b-col cols="5">
            <b-card>
              <b-card-title>
                Example
              </b-card-title>
              <b-card-text>
                <json-editor
                  id="query-example"
                  ref="jsoneditor"
                  tabindex="4"
                  myclass="h-100"
                  :content="
                    `
{
  controller: 'document',
  action: 'create',
  index: 'nyc-open-data',
  collection: 'yellow-taxi',
  _id: 'my-custom-document-id',
  refresh: 'wait_for', // Additional property allowed for this API action
  body: {
    trip_distance: 4.23,
    passenger_count: 2
  }
}`
                  "
                  @change="console.log('lol')"
                />
              </b-card-text>
            </b-card>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12">
            <b-card>
              <b-card-title>
                Response
              </b-card-title>
              <b-card-text>
                <json-editor
                  id="query-response"
                  ref="jsoneditor"
                  tabindex="4"
                  myclass="h-100"
                  :content="
                    `
    { requestId: '49ffb6db-bdff-45b9-b3f6-00442f472393',
      status: 200,
      error: null,
      controller: 'document',
      action: 'create',
      collection: 'yellow-taxi',
      index: 'nyc-open-data',
      volatile: { sdkName: 'javascript@7.0.0' },
      room: '49ffb6db-bdff-45b9-b3f6-00442f472393',
      result:
        { _index: 'nyc-open-data',
          _type: 'yellow-taxi',
          _id: 'my-custom-document-id',
          _version: 1,
          result: 'created',
          _shards: { total: 2, successful: 1, failed: 0 },
          created: true,
          _source:
            { trip_distance: 4.23,
              passenger_count: 2,
              _kuzzle_info:
               { author: '-1',
                  createdAt: 1532529302225,
                  updatedAt: null,
                  updater: null } } } }`
                  "
                  @change="console.log('lol')"
                />
              </b-card-text>
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

export default {
  components: {
    Multipane,
    jsonEditor,
    MultipaneResizer
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
