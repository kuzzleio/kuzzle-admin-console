<template>
  <div class="wrapper">
    <headline>
      {{$route.params.collection}} - Browse
      <collection-dropdown class="icon-medium icon-black" :id="$route.params.index"></collection-dropdown>
    </headline>

    <div class="row">
      <ul class="collapsible" v-collapsible data-collapsible="expandable">
        <li v-for="document in documents">
          <document :document="document"></document>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import {getDocuments} from '../../../vuex/modules/data/actions'
  import {documents} from '../../../vuex/modules/data/getters'
  import jQueryCollapsible from '../../Materialize/collapsible'
  import CollectionDropdown from '../Collections/Dropdown'
  import Document from '../Documents/DocumentItem'

  export default {
    name: 'CollectionBrowse',
    directives: [
      jQueryCollapsible
    ],
    components: {
      Headline,
      CollectionDropdown,
      Document
    },
    ready () {
      this.getDocuments(this.$route.params.index, this.$route.params.collection)
    },
    vuex: {
      actions: {
        getDocuments
      },
      getter: {
        documents
      }
    }
  }
</script>
