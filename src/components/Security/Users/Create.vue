<template>
  <div>
    <headline>
      User - Create
    </headline>

    <Notice />

    <div class="wrapper collection-edit">
      <stepper
        :current-step="editionStep"
        :steps="['Basic', 'Credentials', 'Custom']"
        :disabled-steps="disabledSteps"
        class="card-panel card-header"
        @changed-step="setEditionStep"
      />

      <div class="row card-panel card-body">
        <div class="col s12">
          <steps-content
            ref="stepsContent"
            v-model="user"
            :step="editionStep"
            :is-update="false"
          />

          <!-- Actions -->
          <div class="row">
            <div class="col s3">
              <a
                tabindex="6"
                class="btn-flat waves-effect"
                @click.prevent="cancel"
                >Cancel</a
              >
              <button
                type="submit"
                class="btn primary waves-effect waves-light"
                @click.prevent="submitStep"
              >
                {{ submitStepButtonName }}
              </button>
            </div>
            <div class="col s9">
              <div v-if="error" class="card error red-color white-text">
                <i class="fa fa-times dismiss-error" @click="dismissError()" />
                {{ error }}
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
import StepsContent from './Steps/StepsContent'
import Notice from '../Common/Notice'

export default {
  name: 'UsersSecurityCreate',
  components: {
    Headline,
    Stepper,
    StepsContent,
    Notice
  },
  props: {
    index: String,
    collection: String
  },
  data() {
    return {
      error: '',
      editionStep: 0,
      submitted: false,
      user: {
        kuid: null,
        addedProfiles: [],
        credentials: {},
        customContent: {}
      }
    }
  },
  computed: {
    submitStepButtonName() {
      return this.editionStep < 2 ? 'Next' : 'Save'
    },
    disabledSteps() {
      let disabled = []
      if (!this.hasBasicPayload) {
        disabled.push(1)
      }
      if (!this.hasBasicPayload) {
        disabled.push(2)
      }
      return disabled
    },
    hasBasicPayload() {
      return (
        this.user.addedProfiles.length &&
        (this.user.autoGenerateKuid ||
          (!this.user.autoGenerateKuid && this.user.kuid))
      )
    },
    validations() {
      return [
        () => {
          if (!this.user.autoGenerateKuid && !this.user.kuid) {
            throw new Error(
              'Please fill the custom KUID or check the auto-generate box'
            )
          }
          if (!this.user.addedProfiles.length) {
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
    async create() {
      if (this.submitted) {
        return
      }

      let userObject = {
        content: {
          profileIds: this.user.addedProfiles,
          ...this.user.customContent
        },
        credentials: {
          ...this.user.credentials
        }
      }

      try {
        await this.$kuzzle.security.createUser(this.user.kuid, userObject)
        this.$kuzzle.query({ controller: 'index', action: 'refreshInternal' })
        this.$router.push({ name: 'SecurityUsersList' })
      } catch (err) {
        this.error = err.message
        this.submitted = false
      }
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.go(this.$router._prevTransition.to)
      } else {
        this.$router.push({ name: 'SecurityUsersList' })
      }
    },
    setEditionStep(value) {
      this.editionStep = value
    },
    setError(msg) {
      this.error = msg
      setTimeout(() => {
        this.dismissError()
      }, 5000)
    },
    dismissError() {
      this.error = ''
    },
    onProfileAdded(profile) {
      this.user.addedProfiles.push(profile)
    },
    onProfileRemoved(profile) {
      this.user.addedProfiles.splice(
        this.user.addedProfiles.indexOf(profile),
        1
      )
    },
    submitStep() {
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
    }
  }
}
</script>
