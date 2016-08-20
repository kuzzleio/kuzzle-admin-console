<template>
  <div class="wrapper">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <div class="card-panel">
      <common-browse
        item-name="DocumentItem"
        :collection="collection"
        :index="index"
        @create-clicked="createDocument">

        <div slot="emptySet">
          <div class="row valign-bottom empty-set">
            <div class="col s1 offset-s1">
              <i class="fa fa-6x fa-file-text-o grey-text text-lighten-1" aria-hidden="true"></i>
            </div>
            <div class="col s10">
              <p>
                You will see <strong>{{collection}}'s</strong> documents here<br/>
                <em>For the time there is no one created yet</em>
              </p>
              <button v-link="{name: 'DataCreateDocument', params: {index: index, collection: collection}}"
                      class="btn btn-small primary waves-effect waves-light">
                <i class="fa fa-plus-circle left"></i>
                Create a document
              </button>
            </div>
          </div>
        </div>

      </common-browse>

    </div>
  </div>
</template>

<script>
  import CollectionTabs from './Tabs'
  import CommonBrowse from '../../Common/Browse'
  import Headline from '../../Materialize/Headline'
  import CollectionDropdown from '../Collections/Dropdown'

  export default {
    name: 'DocumentBrowse',
    props: {
      index: String,
      collection: String
    },
    components: {
      CollectionTabs,
      CommonBrowse,
      Headline,
      CollectionDropdown
    },
    methods: {
      createDocument () {
        this.$router.go({name: 'DataCreateDocument'})
      }
    },
    route: {
      data () {
        // let Vue change props before broadcast the event
        setTimeout(() => {
          this.$broadcast('crudl-refresh-search')
        }, 0)
      }
    }
  }
</script>
