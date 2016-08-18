<template>
  <div class="col s12 m6 l4">
    <div class="card">
      <div class="card-title row">

        <div class="col s11 truncate">
          <!-- collection browse link -->
          <a href="#!"
             v-link="{name: 'DataCollectionBrowse', params: {index: index, collection: collection}}">
            <i class="fa grey-text text-darken-1" :class="isRealtime ? 'fa-bolt' : 'fa-th-list'" aria-hidden="true" ></i>
            <span class="name">{{collection}}</span>
          </a>
        </div>

        <div class="col s1 right-align">
          <!-- actions related to the index -->
          <collection-dropdown
            class="icon-small icon-black"
            :collection="collection"
            :index="index"
            :is-realtime="isRealtime">
          </collection-dropdown>
        </div>


      </div>

      <!-- collection summary
      <div class="card-content">

      </div>
      -->

      <div class="card-action right-align">
        <a class="btn btn-small" href="#"
           v-title="{active: !canCreateDocument(index, collection), title: 'Your rights disallow you to create documents on collection ' + collection + ' of index ' + index}"
           :class="{unauthorized: !canCreateDocument(index, collection)}"
		   v-link="canCreateDocument(index, collection) ? {name: 'DataCreateDocument', params: {index: index, collection: collection} : {}}"
           v-if="!isRealtime">
          Create a document
        </a>
        <a class="btn btn-small" href="#"
           v-if="isRealtime"
           v-title="{active: !canManageRealtime(index, collection), title: 'Your rights disallow you to watch realtime messages on collection ' + collection + ' of index ' + index}"
           :class="{unauthorized: !canManageRealtime(index, collection)}"
           v-link="canManageRealtime(index, collection) ? {name: 'DataCollectionWatch', params: {index: index, collection: collection}} : {}">
          Watch messages
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import CollectionDropdown from './Dropdown.vue'
  import {canCreateDocument, canManageRealtime} from '../../../services/userAuthorization'
  import Title from '../../../directives/title.directive'

  export default {
    name: 'CollectionBoxed',
    props: ['index', 'collection', 'isRealtime'],
    components: {
      CollectionDropdown
    },
    methods: {
      canManageRealtime,
      canCreateDocument
    },
    directives: {
      Title
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .name {
    font-family: "Roboto", sans-serif;
  }
  .card-title {
    font-size: 22px;
    padding: 1rem;
    margin-bottom: 0;

    .fa-th-list,
    .fa-bolt {
      font-size: 1.1rem;
      vertical-align: 2px;
      margin-right: 4px;
    }

    .fa-th-list {
      vertical-align: 0;
    }
  }
  .card-content {
    border-top: 1px solid rgba(160, 160, 160, 0.2);
  }
  .switch {
    label {
      .lever {
        margin: 0;
      }
    }
  }
</style>
