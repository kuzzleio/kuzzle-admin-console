<template>
  <div class="wrapper">
    <headline>
      Edit user - <span class="bold">{{ $route.params.id }}</span>
    </headline>

    <Notice />

    <div class="card-panel card-body">
      <div class="col s12">
        <tabs
          v-if="!loading"
          :active="activeTab"
          :object-tab-active="activeTabObject"
          @tab-changed="switchTab"
        >
          <tab
            name="basic"
            tab-select="basic"
            @tabs-on-select="setActiveTabObject"
          >
            <a href="">Basic</a>
          </tab>
          <tab
            name="credentials"
            tab-select="basic"
            @tabs-on-select="setActiveTabObject"
          >
            <a href="">Credentials</a>
          </tab>
          <tab
            name="custom"
            tab-select="basic"
            @tabs-on-select="setActiveTabObject"
          >
            <a href="">Custom</a>
          </tab>
          <div slot="contents">
            <steps-content
              ref="stepsContent"
              v-model="user"
              :step="stepNumber"
              :is-update="true"
            />
          </div>
        </tabs>
      </div>

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
            @click.prevent="save"
          >
            Save
          </button>
        </div>
        <div class="col s9">
          <div
            v-if="error"
            class="card error red-color white-text"
          >
            <i
              class="fa fa-times dismiss-error"
              @click="dismissError()"
            />
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bold {
  font-weight: normal;
}
</style>

<script>
import Headline from '../../Materialize/Headline'
import Tabs from '../../Materialize/Tabs'
import Tab from '../../Materialize/Tab'
import Notice from '../Common/Notice'
import Promise from 'bluebird'
import StepsContent from './Steps/StepsContent'

export default {
  name: 'UpdateUser',
  components: {
    Headline,
    Tabs,
    Tab,
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
        await this.$kuzzle.security.replaceUser(this.user.kuid, userObject)
        await Promise.all(
          Object.keys(this.user.credentials).map(async strategy => {
            const credentialsExists = await this.$kuzzle.security.hasCredentials(strategy, this.user.kuid)

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
        await this.$kuzzle.query(
          { controller: 'index', action: 'refreshInternal' }
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
