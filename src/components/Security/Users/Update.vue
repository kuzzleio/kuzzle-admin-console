<template>
  <div class="UserUpdate">
    <b-container class="UserUpdate--container">
      <headline>
        Edit user - <span class="code">{{ $route.params.id }}</span>
      </headline>

      <Notice />

      <b-card no-body>
        <template v-if="loading">
          <MainSpinner class="my-5" />
        </template>
        <template v-else>
          <b-tabs
            card
            v-if="!loading"
            :active="activeTab"
            :object-tab-active="activeTabObject"
            @tab-changed="switchTab"
          >
            <b-tab id="UserUpdate-basicTab" title="Basic">
              <basic
                :edit-kuid="false"
                :added-profiles="addedProfiles"
                :auto-generate-kuid="autoGenerateKuid"
                :kuid="kuid"
                @set-auto-generate-kuid="setAutoGenerateKuid"
                @set-custom-kuid="setCustomKuid"
                @profile-add="onProfileAdded"
                @profile-remove="onProfileRemoved"
              />
              <credentials-selector
                class="mt-3"
                :credentials="credentials"
                :strategies="strategies"
                :credentials-mapping="credentialsMapping"
                @input="onCredentialsChanged"
              />
            </b-tab>
            <b-tab id="UserUpdate-customTab" title="Custom">
              <custom-data
                :mapping="customContentMapping"
                :value="customContent"
                @input="onCustomContentChanged"
              />
            </b-tab>
          </b-tabs>
        </template>

        <template v-slot:footer>
          <b-row class="mt-2">
            <b-col cols="9"
              ><b-alert :show="error" variant="danger">
                <i class="fa fa-times dismiss-error" @click="dismissError()" />
                {{ error }}
              </b-alert></b-col
            >
            <b-col class="text-right">
              <b-button class="m-1" tabindex="6" @click.prevent="cancel"
                >Cancel</b-button
              >
              <b-button
                class="m-1"
                data-cy="UserUpdate-submit"
                type="submit"
                variant="primary"
                @click.prevent="save"
              >
                Save
              </b-button>
            </b-col>
          </b-row>
        </template>
      </b-card>

      <!-- Actions -->
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
import { getMappingUsers } from '../../../services/kuzzleWrapper'
import Basic from './Steps/Basic'
import CredentialsSelector from './Steps/CredentialsSelector'
import CustomData from './Steps/CustomData'
import Headline from '../../Materialize/Headline'
import Notice from '../Common/Notice'
import MainSpinner from '../../Common/MainSpinner'
import Promise from 'bluebird'

export default {
  name: 'UpdateUser',
  components: {
    Basic,
    CredentialsSelector,
    CustomData,
    Headline,
    MainSpinner,
    Notice
  },
  data() {
    return {
      error: null,
      loading: false,
      refresh: false,
      activeTab: 'basic',
      activeTabObject: null,
      submitting: false,
      kuid: null,
      addedProfiles: [],
      autoGenerateKuid: false,
      credentials: {},
      strategies: [],
      credentialsMapping: {},
      customContent: '{}',
      customContentValue: '{}',
      customContentMapping: {}
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
    onProfileAdded(profile) {
      this.addedProfiles.push(profile)
    },
    onProfileRemoved(profile) {
      this.addedProfiles.splice(this.addedProfiles.indexOf(profile), 1)
    },
    setAutoGenerateKuid(value) {
      this.autoGenerateKuid = value
    },
    setCustomKuid(value) {
      this.kuid = value
    },
    onCredentialsChanged(payload) {
      this.credentials[payload.strategy] = { ...payload.credentials }
    },
    onCustomContentChanged(value) {
      this.customContent = value
    },
    switchTab(name) {
      this.activeTab = name
    },
    setActiveTabObject(tab) {
      this.activeTabObject = tab
    },
    validate() {
      if (!this.addedProfiles.length) {
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
      this.submitting = true

      let userObject = {
        profileIds: this.addedProfiles,
        ...this.customContent
      }

      try {
        await this.$kuzzle.security.replaceUser(this.kuid, userObject, {
          refresh: 'wait_for'
        })
        await Promise.all(
          Object.keys(this.credentials).map(async strategy => {
            const credentialsExists = await this.$kuzzle.security.hasCredentials(
              strategy,
              this.kuid
            )

            if (credentialsExists) {
              await this.$kuzzle.security.updateCredentials(
                strategy,
                this.kuid,
                this.credentials[strategy]
              )
            } else {
              await this.$kuzzle.security.createCredentials(
                strategy,
                this.kuid,
                this.credentials[strategy]
              )
            }
          })
        )
        this.$router.push({ name: 'SecurityUsersList' })
      } catch (err) {
        if (err) {
          this.$log.error(err)
          this.setError(err.message)
          this.submitting = false
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
      this.error = null
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to)
      } else {
        this.$router.push({ name: 'SecurityUsersList' })
      }
    }
  },
  async mounted() {
    this.loading = true

    try {
      let credentialsMapping = await this.$kuzzle.security.getAllCredentialFields()
      this.strategies = Object.keys(credentialsMapping)

      // Clean "kuid" from credentialsMapping
      this.strategies.forEach(strategy => {
        if (credentialsMapping[strategy].kuid) {
          delete credentialsMapping[strategy].kuid
        }
      })
      this.credentialsMapping = credentialsMapping

      const { mapping } = await getMappingUsers()
      if (mapping) {
        this.customContentMapping = mapping
        delete this.customContentMapping.profileIds
      }

      this.kuid = this.$route.params.id

      await Promise.all(
        this.strategies.map(async strategy => {
          const credentialsExists = await this.$kuzzle.security.hasCredentials(
            strategy,
            this.kuid
          )

          if (!credentialsExists) {
            return
          }

          let strategyCredentials = await this.$kuzzle.security.getCredentials(
            strategy,
            this.kuid
          )

          if (strategyCredentials.kuid) {
            delete strategyCredentials.kuid
          }

          this.$set(this.credentials, strategy, strategyCredentials)
        })
      )

      let { _id, content } = await this.$kuzzle.security.getUser(this.kuid)
      this.id = _id
      this.addedProfiles = content.profileIds
      delete content.profileIds
      this.customContent = { ...content }

      this.loading = false
    } catch (e) {
      this.$log.error(e)
      this.$bvToast.toast('The complete error has been printed to console', {
        title: 'Ooops! Something went wrong while loading the user',
        variant: 'warning',
        toaster: 'b-toaster-bottom-right',
        appendToast: true,
        dismissible: true,
        noAutoHide: true
      })
    }
  }
}
</script>
