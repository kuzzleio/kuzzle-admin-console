<template>
  <div class="wrapper collection-edit">
    <headline>
      {{index}} - {{headline}}
    </headline>

    <stepper :current-step="$store.state.collection.editionStep" class="card-panel card-header"></stepper>

    <div class="row card-panel card-body">
      <div class="col s12">
        <mapping
          v-show="$store.state.collection.editionStep === 1"
          :step="$store.state.collection.editionStep"
          @cancel="cancel">
        </mapping>
        <collection-form
          v-show="$store.state.collection.editionStep === 2"
          :mapping="$store.state.collection.mapping"
          :step="$store.state.collection.editionStep"
          @collection-create::create="create"
          @cancel="cancel">
        </collection-form>

        <div class="col s7 m8 l8" v-if="error">
          <div class="card error red-color white-text">
            <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
            An error occurred while {{$store.state.route.params.collection ? 'updating' : 'creating'}} collection: <br>{{error}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import Focus from '../../../directives/focus.directive'
  import {RESET_COLLECTION_DETAIL} from '../../../vuex/modules/collection/mutation-types'
  import Stepper from './Stepper'
  import Mapping from './Steps/Mapping'
  import CollectionForm from './Steps/CollectionForm'

  export default {
    name: 'CollectionCreateOrUpdate',
    components: {
      Headline,
      Stepper,
      Mapping,
      CollectionForm
    },
    directives: {
      Focus
    },
    props: {
      error: String,
      index: String,
      headline: String
    },
    watch: {
      '$store.state.collection.isRealtimeOnly' (value) {
        this.isRealtimeOnly = value
      }
    },
    methods: {
      create () {
        this.$emit('collection-create::create')
      },
      dismissError () {
        this.$emit('collection-create::reset-error')
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.push(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
        }
      }
    },
    beforeDestroy () {
      this.$store.commit(RESET_COLLECTION_DETAIL)
    }
  }
</script>
