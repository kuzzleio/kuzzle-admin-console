<template>
  <div>
    <headline>
      User - Create
    </headline>

    <div class="wrapper collection-edit">
      <stepper
        :current-step="editionStep"
        :steps="['Basic', 'Credentials', 'Custom']"
        :disabled-steps="disabledSteps"
        @changed-step="setEditionStep"
        class="card-panel card-header">
      </stepper>

      <div class="row card-panel card-body">
        <div class="col s12">
          <basic
            v-show="editionStep === 0"
            @cancel="onCancel"
            @error="setError"
            @change-step="onBasicChangedStep"
            @submit="onBasicSubmitted"
          ></basic>
          <credentials v-show="editionStep === 1"></credentials>
          <custom v-show="editionStep === 2"></custom>

          <div class="col s7 m8 l8" v-if="error">
            <div class="card error red-color white-text">
              <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
              An error occurred while creating user: <br>{{error}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import Headline from '../../Materialize/Headline'
  import Stepper from '../../Common/Stepper'
  import Basic from './Steps/Basic'
  import Credentials from './Steps/Credentials'
  import Custom from './Steps/Custom'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingUsers } from '../../../services/kuzzleWrapper'

  export default {
    name: 'UsersSecurityCreate',
    components: {
      Headline,
      Stepper,
      Basic,
      Credentials,
      Custom
    },
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        error: '',
        id: null,
        editionStep: 0,
        basicPayload: null,
        credentialsPayload: null,
        customPayload: null
      }
    },
    computed: {
      disabledSteps () {
        let disabled = []
        if (!this.basicPayload) {
          disabled.push(1)
        }
        if (!this.credentialsPayload) {
          disabled.push(2)
        }
        return disabled
      }
    },
    methods: {
      getMappingUsers,
      create (user) {
        this.error = ''

        if (!user) {
          this.error = 'The document is invalid, please review it'
          return
        }
        if (!this.id) {
          this.error = 'You must set an ID'
          return
        }

        kuzzle
          .security
          .createUserPromise(this.id, user)
          .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
          .then(() => this.$router.push({name: 'SecurityUsersList'}))
          .catch(err => {
            this.error = 'An error occurred while creating user: <br />' + err.message
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityUsersList'})
        }
      },
      setEditionStep (value) {
        this.editionStep = value
      },
      onCancel () {
        this.$router.push({name: 'SecurityUsersList'})
      },
      setError (msg) {
        this.error = msg
        setTimeout(() => {
          this.dismissError()
        }, 5000)
      },
      dismissError () {
        this.error = ''
      },
      onBasicChangedStep (payload) {
        this.basicPayload = payload || {}
      },
      onBasicSubmitted (payload) {
        this.basicPayload = payload || {}
        this.editionStep++
      }
    }
  }
</script>
