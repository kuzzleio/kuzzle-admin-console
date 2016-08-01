<template>
  <div class="wrapper">
    <headline>
      Create a collection in <i>{{$route.params.index}}</i>
    </headline>
    <div class="row">
      <div class="col m4">
        <form @submit.prevent="doCreateCollection">
          <div class="input-field">
            <input id="collectionName" type="text" name="collection" required v-model="collectionName"
                   class="validate"/>
            <label for="collectionName">Collection name</label>
          </div>
          <button class="btn waves-effect waves-light">Create</button>
          <p class="error">{{error}}</p>
        </form>
      </div>
    </div>

    <div class="divider"></div>
    <div class="row">
      <p>
        <input type="checkbox" class="filled-in" id="realtime-collection" v-model="isRealTime" />
        <label for="realtime-collection">Realtime collection</label>
      </p>
    </div>

  </div>
</template>

<style>
  .error {
    color: #d54f58
  }
</style>

<script>
  import Headline from '../../Materialize/Headline'
  import {createCollection} from '../../../vuex/modules/collection/actions'
  import {getError} from '../../../vuex/modules/common/getters'

  export default {
    name: 'CollectionCreate',
    components: {
      Headline
    },
    data () {
      return {
        collectionName: null,
        error: '',
        isRealTime: false
      }
    },
    methods: {
      doCreateCollection () {
        this.createCollection(this.$route.params.index, this.collectionName, this.isRealTime).then(() => {
          this.$router.go({name: 'DataIndexSummary', params: {index: this.$route.params.index}})
        }).catch((e) => {
          this.error = e
        })
      }
    },
    vuex: {
      actions: {
        createCollection
      },
      getters: {
        getError
      }
    }
  }
</script>
