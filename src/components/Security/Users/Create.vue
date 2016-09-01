<template>
  <create-or-update @document-create::create="create" index="%kuzzle" collection="users">
    <div class="row">
      <div class="col s6">
        <a @click.prevent="cancel" class="btn-flat waves-effect">Cancel</a>
        <button type="submit" class="btn waves-effect waves-light"><i class="fa fa-plus-circle"></i> Create</button>
      </div>
    </div>
  </create-or-update>
</template>

<script>
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate.vue'
  // import kuzzle from '../../../services/kuzzle'

  export default {
    name: 'SecurityUsersCreate',
    components: {
      CreateOrUpdate
    },
    data () {
      return {
        content: {}
      }
    },
    methods: {
      create (viewState, json) {
        if (viewState === 'code') {
          if (!json) {
            this.$dispatch('toast', 'Invalid document', 'error')
            return
          }
          this.setNewDocument(json)
        }
//        kuzzle
//          .dataCollectionFactory(this.collection, this.index)
//          .createDocumentPromise(this.newDocument)
//          .then(() => {
//            kuzzle.refreshIndex(this.index)
//            this.$router.go({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
//          }).catch(err => {
//          this.$dispatch('toast', err.message, 'error')
//        })
      },
      cancel () {
        this.$broadcast('document-create::cancel')
      }
    }
  }
</script>