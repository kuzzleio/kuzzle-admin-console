<template>
  <div class="UserUpdate">
    <b-container class="UserUpdate--container">
      <headline>
        Edit user - <span class="bold">{{ $route.params.id }}</span>
      </headline>

      <Notice />

      <div>
        <b-card no-body>
          <b-tabs
            card
            v-if="!loading"
            :active="activeTab"
            :object-tab-active="activeTabObject"
            @tab-changed="switchTab"
          >
            <b-tab title="Basic">
              <steps-content
                ref="stepsContent"
                v-model="user"
                :step="0"
                :is-update="true"
              />
            </b-tab>
            <b-tab title="Credentials">
              <steps-content
                ref="stepsContent"
                v-model="user"
                :step="1"
                :is-update="true"
              />
            </b-tab>
            <b-tab title="Custom">
              <steps-content
                ref="stepsContent"
                v-model="user"
                :step="2"
                :is-update="true"
              />
            </b-tab>
          </b-tabs>
        </b-card>

        <!-- Actions -->
        <b-row align-h="end" class="mt-2">
          <b-col cols="2" class="text-right">
            <b-button class="m-1" tabindex="6" @click.prevent="cancel"
              >Cancel</b-button
            >
            <b-button
              class="m-1"
              type="submit"
              variant="primary"
              @click.prevent="save"
            >
              Save
            </b-button>
          </b-col>
        </b-row>
        <b-row>
          <b-col v-if="error" align-self="start">
            <b-alert :show="error" variant="danger">
              <i class="fa fa-times dismiss-error" @click="dismissError()" />
              {{ error }}
            </b-alert>
          </b-col>
        </b-row>
      </div>
    </b-container>
  </div>
</template>

<style scoped>
.bold {
  font-weight: normal;
}
.UserUpdate--container {
  transition: max-width 0.6s;
}
</style>

<script>
import Headline from '../../Materialize/Headline'
import Notice from '../Common/Notice'
import Promise from 'bluebird'
import StepsContent from './Steps/StepsContent'

export default {
  name: 'UpdateUser',
  components: {
    Headline,
    StepsContent,
    Notice
  },
  data() {
    return {
      error: '',
      loading: false,
      refresh: false,
      activeTab: 'basic',
      activeTabObject: null,
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
    stepNumber() {
      switch (this.activeTab) {
        case 'basic':
          return 0
        case 'credentials':
          return 1
        default:
          return 2
      }
    }
  },
  methods: {
    switchTab(name) {
      this.activeTab = name
    },
    setActiveTabObject(tab) {
      this.activeTabObject = tab
    },
    validate() {
      if (!this.user.addedProfiles.length) {
        throw new Error('Please add at least one profile to the user')
      }

      return true
    },
    async save() {
      try {
        this.validate()
      } catch (e) {
        this.setError(e.message)
        return
      }
      this.submitted = true

      let userObject = {
        profileIds: this.user.addedProfiles,
        ...this.user.customContent
      }

      try {
        await this.$kuzzle.security.replaceUser(this.user.kuid, userObject, {
          refresh: 'wait_for'
        })
        await Promise.all(
          Object.keys(this.user.credentials).map(async strategy => {
            const credentialsExists = await this.$kuzzle.security.hasCredentials(
              strategy,
              this.user.kuid
            )

            if (credentialsExists) {
              await this.$kuzzle.security.updateCredentials(
                strategy,
                this.user.kuid,
                this.user.credentials[strategy]
              )
            } else {
              await this.$kuzzle.security.createCredentials(
                strategy,
                this.user.kuid,
                this.user.credentials[strategy]
              )
            }
          })
        )
        this.$router.push({ name: 'SecurityUsersList' })
      } catch (err) {
        if (err) {
          this.setError(err.message)
          this.submitted = false
        }
      }
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
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to)
      } else {
        this.$router.push({ name: 'SecurityUsersList' })
      }
    }
  }
}
</script>
