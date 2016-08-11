<template>
  <div class="wrapper">
    <headline>
      Create a document
    </headline>

    <div class="row">
      <div class="input-field col m2">
        <input id="id" type="text" name="collection" v-model="id"/>
        <label for="id">Id (optional)</label>
      </div>
    </div>

    <div class="row">
      <div class="col m11">
        <fieldset>
          <div v-for="(name, content) in mapping">
            <mapping :name="name" :content="content"></mapping>
          </div>
        </fieldset>
      </div>
    </div>
    <button @click="create">Create</button>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import Mapping from './Mapping'

  export default {
    name: 'DocumentCreate',
    components: {
      Headline,
      Mapping
    },
    methods: {
      create () {
        this.$broadcast('create-document')
      }
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
