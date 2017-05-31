<template>
  <div class="wrapper collection-edit">
    <stepper
      :current-step="editionStep"
      :steps="['Basic', 'Credentials', 'Custom']"
      @changed-step="setEditionStep"
      class="card-panel card-header">
    </stepper>

    <div class="row card-panel card-body">
      <div class="col s12">
        <basic v-show="editionStep === 0"></basic>
        <credentials v-show="editionStep === 1"></credentials>
        <custom v-show="editionStep === 2"></custom>

        <div class="col s7 m8 l8" v-if="error">
          <div class="card error red-color white-text">
            <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
            An error occurred while {{$store.state.route.params.user ? 'updating' : 'creating'}} user: <br>{{error}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import Headline from '../../Materialize/Headline'
import Stepper from '../../Common/Stepper'
import Basic from './Steps/Basic'
import Credentials from './Steps/Credentials'
import Custom from './Steps/Custom'

export default {
  name: 'UserCreateOrUpdate',
  props: {
    error: String
  },
  components: {
    Headline,
    Stepper,
    Basic,
    Credentials,
    Custom
  },
  data () {
    return {
      editionStep: 0
    }
  },
  methods: {
    setEditionStep (value) {
      this.editionStep = value
    }
  }
}
</script>
