<template>
  <div class="wrapper collection-edit">
    <headline>
      {{headline}} {{index}}
    </headline>

    <stepper
      :current-step="editionStep"
      :disabled-steps="$store.getters.isRealtimeOnly ? [1] : []"
      :steps="['Mapping', 'Form']"
      @changed-step="setEditionStep"
      class="card-panel card-header">
    </stepper>

    <div class="row card-panel card-body">
      <div class="col s12">
        <mapping
          v-show="editionStep === 0"
          :step="editionStep"
          @collection-create::create="create"
          @collection-create::next-step="setEditionStep(1)"
          @collection-create::error="showError"
          @cancel="cancel">
        </mapping>
        <collection-form
          v-show="editionStep === 1"
          :mapping="$store.state.collection.mapping"
          :step="editionStep"
          @collection-create::create="create"
          @cancel="cancel">
        </collection-form>

        <div class="col s7 m8 l8" v-if="error || mappingError">
          <div class="card error red-color white-text">
            <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
            An error occurred while {{$route.params.collection ? 'updating' : 'creating'}} collection: <br>{{error ? error : mappingError}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Headline from '../../Materialize/Headline'
import Focus from '../../../directives/focus.directive'
import Stepper from '../../Common/Stepper'
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
  data() {
    return {
      editionStep: 0,
      mappingError: null
    }
  },
  props: {
    error: String,
    index: String,
    headline: String
  },
  watch: {
    '$store.state.collection.isRealtimeOnly'(value) {
      this.isRealtimeOnly = value
    }
  },
  methods: {
    create() {
      this.$emit('collection-create::create')
    },
    dismissError() {
      this.$emit('collection-create::reset-error')
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to)
      } else {
        this.$router.push({
          name: 'DataIndexSummary',
          params: { index: this.index }
        })
      }
    },
    setEditionStep(stepNumber) {
      this.mappingError = false
      this.editionStep = stepNumber
    },
    showError(e) {
      this.mappingError = e
    }
  }
}
</script>
