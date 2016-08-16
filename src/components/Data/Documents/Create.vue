<template>
  <div class="wrapper">
    <headline>
      Create a document
    </headline>

    <div class="row">
      <div class="input-field col m2">
        <input id="id" type="text" name="collection" v-model="id" />
        <label for="id">Id (optional)</label>
      </div>
    </div>

    <div class="row">
      <div class="col m11">
        <fieldset>
          <div v-for="(name, content) in mapping">
            <json-form :name="name" :content="content"></json-form>
          </div>
        </fieldset>
      </div>
    </div>
    <button @click="create" class="btn waves-effect waves-light"><i class="fa fa-plus-circle"></i> Create</button>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import JsonForm from './JsonForm'
  import {unsetNewDocument} from '../../../vuex/modules/data/actions'
  import {newDocument} from '../../../vuex/modules/data/getters'

  export default {
    name: 'DocumentCreate',
    components: {
      Headline,
      JsonForm
    },
    methods: {
      create () {
        if (this.id) {
          this.newDocument._id = this.id
        }
        kuzzle.dataCollectionFactory(this.$route.params.collection, this.$route.params.index).createDocument(this.newDocument, (err, res) => {
          if (err) {
            this.$dispatch('toast', err.message, 'error')
            return
          }
          kuzzle.refreshIndex(this.$route.params.index)
          this.$router.go({name: 'DataCollectionBrowse', params: {index: this.$route.params.index, collection: this.$route.params.collection}})
        })
      }
    },
    vuex: {
      actions: {
        unsetNewDocument
      },
      getters: {
        newDocument
      }
    },
    beforeDestroy () {
      console.log('##', this.unsetNewDocument)
      this.unsetNewDocument()
    },
    data () {
      return {
        id: '',
        mapping: null
      }
    },
    route: {
      data () {
        kuzzle.dataCollectionFactory(this.$route.params.collection, this.$route.params.index).getMapping((err, res) => {
          if (err) {
            return
          }
          this.mapping = res.mapping
        })
      }
    }
  }
</script>
