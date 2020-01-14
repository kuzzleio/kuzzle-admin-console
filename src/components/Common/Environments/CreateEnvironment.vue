<template>
  <div class="CreateEnvironment environment">
    <b-alert :show="useHttps && !environment.ssl">
      <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> You are
      using the HTTPS/SSL version of the Admin Console. Please ensure that your
      Kuzzle supports HTTPS/SSL connections.
    </b-alert>

    <div class="mb-3 text-right">
      <a v-if="environmentId" ref="export" class="btn">Export</a>
      <b-button
        v-else
        class="CreateEnvironment-import btn"
        variant="outline-info"
        v-b-modal.create-env
      >
        Import a connection
      </b-button>
    </div>

    <b-form>
      <b-form-group
        id="env-name"
        description="A friendly name for the connection"
        label="Connection name"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="input-env-name"
      >
        <b-form-input
          id="input-env-name"
          v-model="environment.name"
          trim
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="env-host"
        label="Hostname"
        description="The host where your Kuzzle is running"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="input-env-host"
      >
        <b-form-input
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
      >
        <b-form-input
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
                class="CreateEnvironment-color"
                :style="{ backgroundColor: color }"
                @click="selectColor(index)"
              >
                <span
                  class="CreateEnvironment-color--selected"
                  v-if="environment.color === color"
                  >Selected</span
                >
              </div>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script>
import Focus from '../../../directives/focus.directive'
import { DEFAULT_COLOR } from '../../../services/environment'

const useHttps = window.location.protocol === 'https:'

export default {
  name: 'CreateEnvironment',
  components: {},
  directives: {
    Focus
  },
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
      colors: [
        DEFAULT_COLOR,
        '#0277bd',
        '#8e24aa',
        '#689f38',
        '#f57c00',
        '#e53935',
        '#546e7a',
        '#d81b60'
      ],
      warningHeaderText: ``
    }
  },
  computed: {
    environments() {
      return this.$store.direct.state.kuzzle.environments
    },
    useHttps() {
      return useHttps
    }
  },
  mounted() {
    if (this.environmentId) {
      const env = {}

      env[
        this.$store.direct.getters.kuzzle.currentEnvironment.name
      ] = Object.assign(
        {},
        this.$store.direct.getters.kuzzle.currentEnvironment
      )

      delete env[this.$store.direct.getters.currentEnvironment.name].token
      const blob = new Blob([JSON.stringify(env)], { type: 'application/json' })

      this.$refs.export.href = URL.createObjectURL(blob)
      this.$refs.export.download = `${this.$store.direct.getters.currentEnvironment.name}.json`
    }
  },
  created() {
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
      this.errors.name = !this.environment.name
      // this.errors.port = (!this.environment.port || typeof this.environment.port !== 'number')
      // Host is required and must be something like 'mydomain.com/toto'
      this.errors.host =
        !this.environment.host || /^(http|ws):\/\//.test(this.environment.host)

      let _host = this.environment.host.trim()
      let _name = this.environment.name.trim()

      if (!this.environmentId || this.environmentId !== _name) {
        this.errors.environmentAlreadyExists =
          this.$store.direct.state.kuzzle.environments[_name] !== undefined
      } else {
        this.errors.environmentAlreadyExists = false
      }

      if (
        this.errors.name ||
        this.errors.host ||
        this.errors.environmentAlreadyExists
      ) {
        throw new Error('Name or host invalid')
      }

      if (this.environmentId) {
        return this.$store.direct.dispatch.kuzzle.updateEnvironment({
          id: this.environmentId,
          environment: {
            name: _name,
            color: this.environment.color,
            host: _host,
            port: this.environment.port,
            ssl: this.environment.ssl
          }
        })
      } else {
        return this.$store.direct.dispatch.kuzzle.createEnvironment({
          id: _name,
          environment: {
            name: _name,
            color: this.environment.color,
            host: _host,
            port: this.environment.port,
            ssl: this.environment.ssl
          }
        })
      }
    },
    selectColor(index) {
      this.environment.color = this.colors[index]
    }
  }
}
</script>

<style lang="scss" scoped>
.CreateEnvironment-color {
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
