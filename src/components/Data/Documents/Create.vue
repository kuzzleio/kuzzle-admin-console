<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Create a document
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <div class="row">
      <div class="col s12 m10 l8 card">

        <form class="wrapper" @submit.prevent="create">
          <div class="row">
            <!-- Collection name -->
            <div class="col s6">
              <div class="input-field">
                <input id="id" type="text" name="collection" v-model="id" />
                <label for="id">Document identifier (optional)</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="divider"></div>
          </div>

          <div class="row">
            <div class="col s12">
              <fieldset>
                <div v-for="(name, content) in mapping">
                  <json-form :name="name" :content="content"></json-form>
                </div>
              </fieldset>
            </div>
          </div>

          <div class="row">
            <div class="col s6">
              <button type="submit" class="btn waves-effect waves-light"><i class="fa fa-plus-circle"></i> Create</button>
              <button @click.prevent="cancel" class="btn-flat waves-effect">Cancel</button>
            </div>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
  fieldset {
    border: 0;
    margin: 0;
    padding: 0;

    legend {
      border: 0;
      padding: 0;
      font-weight: 300;
      left: -4px;
      position: absolute;
      top: -27px;
      font-family: "Roboto", Arial, sans-serif;
    }

    fieldset {
      border-left: solid 3px #EEE;
      position: relative;
      margin: 45px 0 15px 0;
      padding: 0 0 0 1em;

      &:hover, &:focus, &.active {
        border-left: solid 3px #DDD;
      }
    }
  }
</style>

<script>
  import CollectionDropdown from '../Collections/Dropdown'
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import JsonForm from './JsonForm'
  import {unsetNewDocument} from '../../../vuex/modules/data/actions'
  import {newDocument} from '../../../vuex/modules/data/getters'

  export default {
    name: 'DocumentCreate',
    components: {
      CollectionDropdown,
      Headline,
      JsonForm
    },
    props: {
      index: String,
      collection: String
    },
    methods: {
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'DataCollectionBrowse', params: {index: this.index, collection: this.collection}})
        }
      },
      create () {
        if (this.id) {
          this.newDocument._id = this.id
        }
        kuzzle.dataCollectionFactory(this.collection, this.index).createDocument(this.newDocument, (err, res) => {
          if (err) {
            this.$dispatch('toast', err.message, 'error')
            return
          }
          kuzzle.refreshIndex(this.index)
          this.$router.go({name: 'DataCollectionBrowse', params: {index: this.index, collection: this.collection}})
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
        kuzzle.dataCollectionFactory(this.collection, this.index).getMapping((err, res) => {
          if (err) {
            return
          }
          this.mapping = res.mapping
        })
      }
    }
  }
</script>
