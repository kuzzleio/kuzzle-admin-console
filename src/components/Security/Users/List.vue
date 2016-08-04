<template>
  <div>
    <headline title="Users Management"></headline>

    <crudl-document index="%kuzzle" collection="users" :documents="documents" :display-bulk-delete="displayBulkDelete" :all-checked="allChecked" :length-document="selectedDocuments.length">
      <div class="collection">
        <div class="collection-item" transition="collection" v-for="document in documents">
          <user-item @checkbox-click="toggleSelectDocuments" :user="document" :is-checked="isChecked(document.id)"></user-item>
        </div>
      </div>
    </crudl-document>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import CrudlDocument from '../../Common/CrudlDocument'
  import UserItem from './UserItem'
  import {documents} from '../../../vuex/modules/common/crudlDocument/getters'

  export default {
    name: 'UsersList',
    components: {
      Headline,
      UserItem,
      CrudlDocument
    },
    data () {
      return {
        selectedDocuments: []
      }
    },
    vuex: {
      getters: {
        documents
      }
    },
    route: {
      data () {
        this.$broadcast('perform-search')
      }
    },
    computed: {
      displayBulkDelete () {
        return this.selectedDocuments.length > 0
      },
      allChecked () {
        return this.selectedDocuments.length === this.documents.length
      }
    },
    methods: {
      isChecked (id) {
        return this.selectedDocuments.indexOf(id) > -1
      },
      toggleAll () {
        if (this.allChecked) {
          this.selectedDocuments = []
          return
        }

        this.selectedDocuments = []
        this.selectedDocuments = this.documents.map((document) => document.id)
      },
      toggleSelectDocuments (id) {
        let index = this.selectedDocuments.indexOf(id)

        if (index === -1) {
          this.selectedDocuments.push(id)
          return
        }

        this.selectedDocuments.splice(index, 1)
      }
    },
    events: {
      'toggle-foo' () {
        this.toggleAll()
      }
    }
  }
</script>
