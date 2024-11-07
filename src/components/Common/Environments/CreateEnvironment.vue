<template>
  <div class="CreateEnvironment environment">
    <b-form>
      <b-form-group
        id="env-name"
        data-cy="CreateEnvironment-name--group"
        description="A friendly name for the connection"
        label="Connection name"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="input-env-name"
        :invalid-feedback="nameFeedback"
      >
        <b-form-input
          id="input-env-name"
          v-model="v$.environment.name.$model"
          data-cy="CreateEnvironment-name"
          :state="validateState('name')"
        />
      </b-form-group>

      <b-form-group
        id="env-host"
        data-cy="CreateEnvironment-host--group"
        description="The host where your Kuzzle is running"
        label="Hostname"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="input-env-host"
        :invalid-feedback="hostFeedback"
      >
        <b-form-input
          id="input-env-host"
          v-model="v$.environment.host.$model"
          data-cy="CreateEnvironment-host"
          :state="validateState('host')"
        />
      </b-form-group>

      <b-form-group
        id="env-port"
        data-cy="CreateEnvironment-port--group"
        label="Port"
        description="The port where your Kuzzle is listening for connections"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="input-env-port"
        :invalid-feedback="portFeedback"
      >
        <b-form-input
          id="input-env-port"
          v-model="v$.environment.port.$model"
          data-cy="CreateEnvironment-port"
          type="number"
          :state="validateState('port')"
        />
      </b-form-group>

      <b-form-group
        label="Use SSL"
        label-for="env-ssl"
        label-cols-sm="4"
        label-cols-lg="3"
        :description="sslFeedback"
      >
        <b-form-checkbox
          id="env-ssl"
          v-model="environment.ssl"
          name="env-use-ssl"
          :value="true"
          :unchecked-value="false"
        />
        <b-form-invalid-feedback id="env-ssl-feedback">
          <i class="fa fa-exclamation-triangle" aria-hidden="true" />
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group
        data-cy="CreateEnvironment-backendVersion--group"
        label="Kuzzle version"
        label-cols-sm="4"
        label-cols-lg="3"
        :invalid-feedback="versionFeedback"
      >
        <b-form-select
          v-model="v$.environment.backendMajorVersion.$model"
          data-cy="CreateEnvironment-backendVersion"
          :state="validateState('backendMajorVersion')"
          :options="majorVersions"
        />
      </b-form-group>

      <b-row>
        <b-col sm="4" lg="3">
          <div>Pick a color</div>
          <small class="text-secondary"
            >It will be applied to the header navbar so you can distinguish this connection from
            other ones.</small
          >
        </b-col>
        <b-col>
          <b-row>
            <b-col v-for="(color, index) in colors" :key="color" sm="6" md="3">
              <div
                :class="`CreateEnvironment-box EnvColor--${color}`"
                :data-cy="`EnvColor--${color}`"
                @click="selectColor(index)"
              >
                <span v-if="environment.color === color">Selected</span>
              </div>
            </b-col>
            <span
              v-if="colorState === false"
              class="CreateEnvironment-box-feedback text-danger ml-2"
            >
              <small>You must select a color for this connection</small></span
            >
          </b-row>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { numeric, required, helpers } from '@vuelidate/validators';

import { useKuzzleStore } from '@/stores';
import { DEFAULT_COLOR, ENV_COLORS, NO_ADMIN_WARNING_HOSTS } from '@/utils';
import { isValidHostname, notIncludeScheme } from '@/validators';

const useHttps = window.location.protocol === 'https:';

/**
 * Vuelidate validator.
 * The validator framework injects the execution context (`this`
 * is the current component).
 */
function nameIsUnique(value) {
  if (this.environmentId) {
    return true;
  }

  return !Object.keys(this.environments).includes(value);
}
// function isValidColor(color) {
//   return ENV_COLORS.includes(color)
// }

export default {
  name: 'CreateEnvironment',
  components: {},
  props: ['environmentId'],
  setup() {
    return {
      v$: useVuelidate(),
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      majorVersions: [
        { value: null, text: 'Select version' },
        { value: 1, text: 'v1.x' },
        {
          value: 2,
          text: 'v2.x',
        },
      ],
      environment: {
        name: '',
        host: '',
        port: 7512,
        color: null,
        ssl: useHttps,
        backendMajorVersion: null,
        hideAdminWarning: false,
      },
      submitting: false,
    };
  },
  validations: {
    environment: {
      name: {
        required: helpers.withMessage('You must enter a non-empty environment name', required),
        nameIsUnique: helpers.withMessage(
          'An environment with the same name already exists',
          nameIsUnique,
        ),
      },
      host: {
        required: helpers.withMessage('You must enter a non-empty host name', required),
        notIncludeScheme: helpers.withMessage(
          'Do not include the protocol in your host name',
          notIncludeScheme,
        ),
        isValidHostname: helpers.withMessage('Must be a valid host name', isValidHostname),
      },
      port: {
        required: helpers.withMessage('You must enter a non-empty port', required),
        numeric: helpers.withMessage('Port must be a number', numeric),
      },
      color: {
        required: helpers.withMessage('You must select a color for this environment', required),
        isValidColor: helpers.withMessage('You must select a valid color', (color) =>
          ENV_COLORS.includes(color),
        ),
      },
      backendMajorVersion: {
        required: helpers.withMessage('You must select a backend version', required),
      },
    },
  },
  computed: {
    colors() {
      return ENV_COLORS;
    },
    environments() {
      return this.kuzzleStore.environments;
    },
    useHttps() {
      return useHttps;
    },
    nameFeedback() {
      if (this.v$.environment.name.$errors.length > 0) {
        return this.v$.environment.name.$errors[0].$message;
      }

      return null;
    },
    hostFeedback() {
      if (this.v$.environment.host.$errors.length > 0) {
        return this.v$.environment.host.$errors[0].$message;
      }

      return null;
    },
    portFeedback() {
      if (this.v$.environment.port.$errors.length > 0) {
        return this.v$.environment.port.$errors[0].$message;
      }

      return null;
    },
    sslFeedback() {
      if (this.useHttps && !this.environment.ssl) {
        return `You are
          using an Admin Console served via HTTPs. Your browser might refuse to
          open an unsecure connection to Kuzzle`;
      }

      if (this.environment.ssl) {
        return `Please ensure your Kuzzle instance supports secure Websocket connections`;
      }

      return '';
    },
    versionFeedback() {
      if (this.v$.environment.backendMajorVersion.$errors.length > 0) {
        return this.v$.environment.backendMajorVersion.$errors[0].$message;
      }

      return null;
    },
    colorState() {
      const { $dirty, $error } = this.v$.environment.color;
      const state = $dirty ? !$error : null;
      return state;
    },
  },
  mounted() {
    const currentEnv = this.environments[this.environmentId];
    if (this.environmentId && currentEnv) {
      this.environment.name = currentEnv.name;
      this.environment.host = currentEnv.host;
      this.environment.port = currentEnv.port;
      this.environment.color = currentEnv.color;
      this.environment.ssl = currentEnv.ssl;
      this.environment.backendMajorVersion = currentEnv.backendMajorVersion;
      this.environment.hideAdminWarning = currentEnv.hideAdminWarning;
      this.$nextTick(() => this.showValidationErrors());
    } else {
      this.environment.name = null;
      this.environment.host = null;
      this.environment.port = 7512;
      this.environment.color = DEFAULT_COLOR;
      this.environment.ssl = useHttps;
      this.environment.backendMajorVersion = null;
      this.environment.hideAdminWarning = false;
    }
  },
  methods: {
    validateState(fieldName) {
      const { $dirty, $error } = this.v$.environment[fieldName];
      const state = $dirty ? !$error : null;
      return state;
    },
    showValidationErrors() {
      this.v$.environment.$touch();
      Object.keys(this.v$.environment).forEach((field) => {
        if (/^\$/.test(field)) {
          return;
        }
        if (this.v$.environment[field].$errors.length === 0) {
          this.v$.environment[field].$reset();
        }
      });
    },
    checkSSL() {
      if (this.environment.port === 443) {
        this.environment.ssl = true;
      }
    },
    submit() {
      this.v$.environment.$touch();
      if (this.v$.environment.$errors.length > 0) {
        return;
      }
      this.submitting = true;
      try {
        if (this.environmentId) {
          return this.kuzzleStore.updateEnvironment({
            id: this.environmentId,
            environment: {
              name: this.environment.name,
              color: this.environment.color,
              host: this.environment.host,
              port: parseInt(this.environment.port),
              ssl: this.environment.ssl,
              backendMajorVersion: this.environment.backendMajorVersion,
              hideAdminWarning: this.environment.hideAdminWarning,
            },
          });
        } else {
          return this.kuzzleStore.createEnvironment({
            id: this.environment.name,
            environment: {
              name: this.environment.name,
              color: this.environment.color,
              host: this.environment.host,
              port: parseInt(this.environment.port),
              ssl: this.environment.ssl,
              backendMajorVersion: this.environment.backendMajorVersion,
              hideAdminWarning: !!NO_ADMIN_WARNING_HOSTS.includes(this.environment.host),
            },
          });
        }
      } catch (error) {
        this.$log.error(error.message);
        this.$bvToast.toast(error.message, {
          title: 'Ooops! Something went wrong while creating the new environment.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
      }
      this.submitting = false;
    },
    selectColor(index) {
      this.v$.environment.color.$model = this.colors[index];
    },
  },
};
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
