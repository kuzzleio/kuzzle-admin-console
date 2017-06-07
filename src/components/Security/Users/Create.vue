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
            :edit-kuid="true"
            :added-profiles="addedProfiles"
            :auto-generate-kuid="autoGenerateKuid"
            :kuid="id"
            @set-auto-generate-kuid="setAutoGenerateKuid"
            @set-custom-kuid="setCustomKuid"
            @profile-add="onProfileAdded"
            @profile-remove="onProfileRemoved"
          ></basic>
          <credentials
            v-show="editionStep === 1"
            id-mapping="credentialsMapping"
            id-content="credentialsMapping"
            @input="onCredentialsChanged"
          ></credentials>
          <custom
            v-show="editionStep === 2"
            :mapping="customMapping"
            @input="onCustomChanged"
          ></custom>

          <!-- Actions -->
          <div class="row">
            <div class="col s3">
              <a
                tabindex="6"
                class="btn-flat waves-effect"
                @click.prevent="cancel"
              >Cancel</a>
              <button
                type="submit"
                class="btn primary waves-effect waves-light"
                @click.prevent="submitStep"
              >{{editionStep < 2 ? 'Next' : 'Save'}}</button>
            </div>
            <div class="col s9">
              <div v-if="error" class="card error red-color white-text">
                <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
                {{error}}
              </div>
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
  import Credentials from './Steps/CredentialsSelector'
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
        customMapping: {},
        editionStep: 0,
        addedProfiles: [],
        autoGenerateKuid: false,
        credentials: null,
        custom: null
      }
    },
    computed: {
      disabledSteps () {
        let disabled = []
        if (!this.hasBasicPayload) {
          disabled.push(1)
        }
        if (!this.hasBasicPayload) {
          disabled.push(2)
        }
        return disabled
      },
      hasBasicPayload () {
        return this.addedProfiles.length &&
              (this.autoGenerateKuid ||
              (!this.autoGenerateKuid && this.id))
      },
      validations () {
        return [
          () => {
            if (!this.autoGenerateKuid && !this.id) {
              throw new Error('Please fill the custom KUID or check the auto-generate box')
            }
            if (!this.addedProfiles.length) {
              throw new Error('Please add at least one profile to the user')
            }
            return true
          },
          () => {
            return true
          },
          () => {
            return true
          }
        ]
      }
    },
    methods: {
      getMappingUsers,
      create () {
        let userObject = {
          content: {
            profileIds: this.addedProfiles,
            ...this.custom
          },
          credentials: {
            ...this.credentials
          }
        }

        kuzzle
          .security
          .createUserPromise(this.id, userObject)
          .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
          .then(() => this.$router.push({name: 'SecurityUsersList'}))
          .catch(err => {
            this.error = err.message
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
      setError (msg) {
        this.error = msg
        setTimeout(() => {
          this.dismissError()
        }, 5000)
      },
      dismissError () {
        this.error = ''
      },
      onProfileAdded (profile) {
        this.addedProfiles.push(profile)
      },
      onProfileRemoved (profile) {
        this.addedProfiles.splice(this.addedProfiles.indexOf(profile), 1)
      },
      setAutoGenerateKuid (value) {
        this.autoGenerateKuid = value
      },
      setCustomKuid (value) {
        this.id = value
      },
      submitStep () {
        if (this.editionStep < 2) {
          try {
            this.validations[this.editionStep]()
            this.editionStep++
          } catch (e) {
            this.setError(e.message)
          }
        } else {
          this.create({
            // TODO
          })
        }
      },
      onCredentialsChanged (payload) {
        this.credentials = payload
      },
      onCustomChanged (payload) {
        this.custom = payload
      }
    },
    mounted () {
      return getMappingUsers()
        .then(result => {
          if (!result.mapping.content || !result.mapping.content.properties) {
            this.customMapping = {}
          } else {
            this.customMapping = result.mapping.content.properties
          }
        })
    }
  }
</script>
