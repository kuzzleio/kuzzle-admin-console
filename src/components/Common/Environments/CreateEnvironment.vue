<template>
  <div class="CreateEnvironment environment">
    <b-alert :show="useHttps && !environment.ssl">
      <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> You are
      using the HTTPS/SSL version of the Admin Console. Please ensure that your
      Kuzzle supports HTTPS/SSL connections.
    </b-alert>

    <b-form>
      <b-form-group
        description="A friendly name for the connection"
        id="env-name"
        label="Connection name"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="input-env-name"
        :invalid-feedback="nameFeedback"
        :state="nameState"
      >
        <b-form-input
          autofocus
          id="input-env-name"
          v-model="environment.name"
          trim
          required
          data-cy="CreateEnvironment-name"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        description="The host where your Kuzzle is running"
        id="env-host"
        label="Hostname"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="input-env-host"
        :invalid-feedback="hostFeedback"
        :state="hostState"
      >
        <b-form-input
          data-cy="CreateEnvironment-host"
          id="input-env-host"
          v-model="environment.host"
          trim
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="env-port"
        label="Port"
        description="The port where your Kuzzle is listening for connections"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="input-env-port"
        :invalid-feedback="portFeedback"
        :state="portState"
      >
        <b-form-input
          data-cy="CreateEnvironment-port"
          id="input-env-port"
          v-model="environment.port"
          type="number"
          trim
          required
        ></b-form-input>
      </b-form-group>
      <b-form-group label="Use SSL" label-cols-sm="4" label-cols-lg="3">
        <b-form-checkbox
          id="env-ssl"
          v-model="environment.ssl"
          name="env-use-ssl"
          :value="true"
          :unchecked-value="false"
        ></b-form-checkbox>
      </b-form-group>

      <b-row>
        <b-col sm="4" lg="3">
          <p>Pick a color</p>
        </b-col>
        <b-col>
          <b-row>
            <b-col sm="6" md="3" v-for="(color, index) in colors" :key="color">
              <div
                :class="`CreateEnvironment-box EnvColor--${color}`"
                :data-cy="`EnvColor--${color}`"
                @click="selectColor(index)"
              >
                <span v-if="environment.color === color">Selected</span>
              </div>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-alert :show="errors.environmentAlreadyExists" variant="danger">
        An environment with the same name exists already
      </b-alert>
      <b-alert :show="errors.host" variant="danger">
        The hostname is invalid
      </b-alert>
      <b-alert :show="errors.name" variant="danger">
        The hostname is invalid
      </b-alert>
    </b-form>
  </div>
</template>

<script>
import {
  DEFAULT_COLOR,
  envColors
} from '../../../vuex/modules/common/kuzzle/store'
const useHttps = window.location.protocol === 'https:'

export default {
  name: 'CreateEnvironment',
  components: {},
  props: ['environmentId'],
  data() {
    return {
      errors: {
        name: false,
        host: false,
        environmentAlreadyExists: false
      },
      environment: {
        name: null,
        host: null,
        port: 7512,
        color: DEFAULT_COLOR,
        ssl: useHttps
      },

      submitting: false
    }
  },
  computed: {
    colors() {
      return envColors
    },
    environments() {
      return this.$store.direct.state.kuzzle.environments
    },
    useHttps() {
      return useHttps
    },
    nameState() {
      if (this.submitting) {
        return true
      }
      return (
        this.environment.name != null &&
        this.environment.name != '' &&
        (this.environmentId !== null ||
          this.environments[this.environment.name] === undefined)
      )
    },
    nameFeedback() {
      if (this.submitting) {
        return ''
      }
      if (this.environment.name == '') {
        return 'You must enter a non-empty name'
      }
      if (
        !this.environmentId &&
        this.environments[this.environment.name] !== undefined
      ) {
        return 'An environment with the same name already exists'
      }
      return ''
    },
    hostState() {
      if (this.submitting) {
        return true
      }
      return (
        this.environment.host != null &&
        this.environment.host != '' &&
        !/^(http|ws):\/\//.test(this.environment.host)
      )
    },
    hostFeedback() {
      if (this.submitting) {
        return ''
      }
      if (this.environment.host == '') {
        return 'You must enter a non-empty host name'
      }
      if (/^(http|ws):\/\//.test(this.environment.host)) {
        return 'Do not include the protocol in your host name'
      }
      return ''
    },
    portState() {
      if (this.submitting) {
        return true
      }
      return this.environment.port !== null && this.environment.port !== ''
    },
    portFeedback() {
      if (this.submitting) {
        return ''
      }
      if (this.environment.port !== '') {
        return 'You must enter a non-empty port'
      }
      return ''
    },
    canSubmit() {
      return this.hostState && this.nameState && this.portState
    }
  },
  mounted() {
    if (this.environmentId && this.environments[this.environmentId]) {
      this.environment.name = this.environments[this.environmentId].name
      this.environment.host = this.environments[this.environmentId].host
      this.environment.port = this.environments[this.environmentId].port
      this.environment.color = this.environments[this.environmentId].color
      this.environment.ssl = this.environments[this.environmentId].ssl
    } else {
      this.environment.name = null
      this.environment.host = null
      this.environment.port = 7512
      this.environment.color = DEFAULT_COLOR
      this.environment.ssl = useHttps
    }
  },
  methods: {
    createEnvironment() {
      if (!this.canSubmit) {
        return false
      }
      this.submitting = true
      try {
        if (this.environmentId) {
          return this.$store.direct.dispatch.kuzzle.updateEnvironment({
            id: this.environmentId,
            environment: {
              name: this.environment.name,
              color: this.environment.color,
              host: this.environment.host,
              port: this.environment.port,
              ssl: this.environment.ssl
            }
          })
        } else {
          return this.$store.direct.dispatch.kuzzle.createEnvironment({
            id: this.environment.name,
            environment: {
              name: this.environment.name,
              color: this.environment.color,
              host: this.environment.host,
              port: this.environment.port,
              ssl: this.environment.ssl
            }
          })
        }
      } catch (error) {
        this.$log.error(error.message)
        this.$bvToast.toast(
          'The complete error has been dumped to the console.',
          {
            title:
              'Ooops! Something went wrong while creating the new environment.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
      this.submitting = false
    },
    selectColor(index) {
      this.environment.color = this.colors[index]
    }
  }
}
</script>

<style lang="scss" scoped>
.CreateEnvironment-box {
  margin-bottom: 10px;
  color: #fff;
  border-radius: 5px;
  line-height: 40px;
  min-height: 40px;
  text-align: center;
  text-transform: uppercase;
  cursor: pointer;
}
</style>
