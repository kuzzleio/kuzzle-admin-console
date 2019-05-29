<template>
  <div class="CollectionCreateOrUpdate wrapper">
    <headline>
      <span class="CollectionCreateOrUpdate-index">
        {{ index }}
        <i class="fa fa-angle-right" />
      </span>
      {{ headline }}
    </headline>

    <stepper
      :current-step="editionStep"
      :disabled-steps="$store.getters.isRealtimeOnly ? [1] : []"
      :steps="['Mapping', 'Form']"
      class="card-panel card-header"
      @changed-step="setEditionStep"
    />

    <div class="row card-panel card-body">
      <div class="col s12">
        <mapping
          v-show="editionStep === 0"
          :step="editionStep"
          @collection-create::create="create"
          @collection-create::next-step="setEditionStep(1)"
          @collection-create::error="showError"
          @cancel="cancel"
        />
        <collection-form
          v-show="editionStep === 1"
          :mapping="$store.state.collection.mapping"
          :step="editionStep"
          @collection-create::create="create"
          @cancel="cancel"
        />

        <div
          v-if="error || mappingError"
          class="col s7 m8 l8"
        >
          <div class="card error red-color white-text">
            <i
              class="fa fa-times dismiss-error"
              @click="dismissError()"
            />
            An error occurred while {{ $route.params.collection ? 'updating' : 'creating' }} collection: <br>{{ error ? error : mappingError }}
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
  props: {
    error: String,
    index: String,
    headline: String
  },
  data() {
    return {
      editionStep: 0,
      mappingError: null
    }
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

<style lang="scss" scoped>
// @TODO pass this code to BEM
.CollectionCreateOrUpdate {
  .CollectionCreateOrUpdate-index {
    color: $grey-color;
  }
  .error {
    position: relative;
    padding: 8px 12px;
    margin: 0;
  }
  .dismiss-error {
    position: absolute;
    right: 10px;
    cursor: pointer;
    padding: 3px;
    border-radius: 2px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>
