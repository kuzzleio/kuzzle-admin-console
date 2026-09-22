<template>
  <div class="CreateEnvironment environment">
    <form class="tw:flex tw:flex-col tw:gap-4">
      <FormItem id="env-name" data-cy="CreateEnvironment-name--group">
        <Label for="input-env-name">Connection name</Label>
        <Input
          id="input-env-name"
          v-model="v$.environment.name.$model"
          :aria-invalid="nameFeedback ? 'true' : undefined"
          data-cy="CreateEnvironment-name"
        />
        <FormDescription>A friendly name for the connection</FormDescription>
        <FormMessage v-if="nameFeedback">{{ nameFeedback }}</FormMessage>
      </FormItem>

      <FormItem id="env-host" data-cy="CreateEnvironment-host--group">
        <Label for="input-env-host">Hostname</Label>
        <Input
          id="input-env-host"
          v-model="v$.environment.host.$model"
          :aria-invalid="hostFeedback ? 'true' : undefined"
          data-cy="CreateEnvironment-host"
        />
        <FormDescription>The host where your Kuzzle is running</FormDescription>
        <FormMessage v-if="hostFeedback">{{ hostFeedback }}</FormMessage>
      </FormItem>

      <FormItem id="env-port" data-cy="CreateEnvironment-port--group">
        <Label for="input-env-port">Port</Label>
        <Input
          id="input-env-port"
          v-model="v$.environment.port.$model"
          :aria-invalid="portFeedback ? 'true' : undefined"
          data-cy="CreateEnvironment-port"
          type="number"
        />
        <FormDescription>The port where your Kuzzle is listening for connections</FormDescription>
        <FormMessage v-if="portFeedback">{{ portFeedback }}</FormMessage>
      </FormItem>

      <FormItem>
        <div class="tw:flex tw:items-center tw:gap-2">
          <Checkbox id="env-ssl" v-model="environment.ssl" name="env-use-ssl" />
          <Label for="env-ssl">Use SSL</Label>
        </div>
        <!--
          `b-form-invalid-feedback` ne rendait qu'une icône d'alerte, sans
          texte et sans condition d'affichage : elle n'a jamais rien dit.
          L'avertissement, lui, est le `description` — il reste.
        -->
        <FormDescription v-if="sslFeedback">{{ sslFeedback }}</FormDescription>
      </FormItem>

      <FormItem data-cy="CreateEnvironment-backendVersion--group">
        <Label id="env-version-label">Kuzzle version</Label>
        <Select
          :model-value="v$.environment.backendMajorVersion.$model"
          @update:modelValue="v$.environment.backendMajorVersion.$model = $event"
        >
          <SelectTrigger
            aria-labelledby="env-version-label"
            :aria-invalid="versionFeedback ? 'true' : undefined"
            data-cy="CreateEnvironment-backendVersion"
          >
            <!--
              Le libellé est passé dans le slot : `SelectValue` ne connaît les
              libellés qu'une fois la liste ouverte, puisque les `SelectItem`
              s'enregistrent à leur montage. Ici la valeur (`2`) et le libellé
              (`v2.x`) diffèrent, et le champ affichait « 2 » tant que la liste
              n'avait pas été déployée une première fois. Le cas est prévu par
              la documentation de la primitive (ADR-0014).
            -->
            <SelectValue placeholder="Select version">{{ versionLabel }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="version of majorVersions" :key="version.value" :value="version.value"
              >{{ version.text }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage v-if="versionFeedback">{{ versionFeedback }}</FormMessage>
      </FormItem>

      <div class="tw:flex tw:flex-col tw:gap-3 tw:sm:flex-row">
        <div class="tw:sm:w-1/3">
          <div>Pick a color</div>
          <small class="tw:text-secondary"
            >It will be applied to the header navbar so you can distinguish this connection from
            other ones.</small
          >
        </div>
        <div class="tw:flex-1">
          <div class="tw:grid tw:grid-cols-2 tw:gap-2 tw:md:grid-cols-4">
            <button
              v-for="(color, index) in colors"
              :key="color"
              :aria-label="`Pick the color ${color}`"
              :aria-pressed="String(environment.color === color)"
              class="tw:min-h-10 tw:cursor-pointer tw:rounded-md tw:text-center tw:text-sm tw:uppercase tw:leading-10 tw:text-white"
              :class="`CreateEnvironment-box EnvColor--${color}`"
              :data-cy="`EnvColor--${color}`"
              type="button"
              @click="selectColor(index)"
            >
              <span v-if="environment.color === color">Selected</span>
            </button>
          </div>
          <FormMessage v-if="colorState === false" class="tw:mt-2">
            You must select a color for this connection
          </FormMessage>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { numeric, required, helpers } from '@vuelidate/validators';

import { Checkbox } from '@/components/ui/checkbox';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  components: {
    Checkbox,
    FormDescription,
    FormItem,
    FormMessage,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  },
  // Forme objet plutôt que tableau : c'est ce qui permet à `vue-tsc` de
  // vérifier les sites d'appel depuis un composant repris en TypeScript.
  props: {
    environmentId: {
      default: null,
      type: String,
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      majorVersions: [
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
    versionLabel() {
      const version = this.majorVersions.find(
        (entry) => entry.value === this.environment.backendMajorVersion,
      );

      return version ? version.text : '';
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
      this.environment.backendMajorVersion = 2;
      this.environment.hideAdminWarning = false;
    }
  },
  methods: {
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
