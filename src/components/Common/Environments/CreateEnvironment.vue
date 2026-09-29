<template>
  <div class="CreateEnvironment">
    <form class="flex flex-col gap-4">
      <FormItem id="env-name" data-cy="CreateEnvironment-name--group">
        <Label for="input-env-name">Connection name</Label>
        <Input
          id="input-env-name"
          v-model="v$.environment.name.$model"
          :aria-invalid="fieldState('name')"
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
          :aria-invalid="fieldState('host')"
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
          :aria-invalid="fieldState('port')"
          data-cy="CreateEnvironment-port"
          type="number"
        />
        <FormDescription>The port where your Kuzzle is listening for connections</FormDescription>
        <FormMessage v-if="portFeedback">{{ portFeedback }}</FormMessage>
      </FormItem>

      <FormItem>
        <div class="flex items-center gap-2">
          <Checkbox id="env-ssl" v-model="environment.ssl" name="env-use-ssl" />
          <Label class="text-ui font-normal normal-case text-foreground" for="env-ssl"
            >Use SSL</Label
          >
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
          @update:modelValue="onVersionSelect"
        >
          <SelectTrigger
            aria-labelledby="env-version-label"
            :aria-invalid="versionFeedback ? 'true' : undefined"
            data-cy="CreateEnvironment-backendVersion"
          >
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="version of majorVersions" :key="version.value" :value="version.value"
              >{{ version.text }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage v-if="versionFeedback">{{ versionFeedback }}</FormMessage>
      </FormItem>

      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="sm:w-1/3">
          <div class="text-label font-bold uppercase text-label-slate">Pick a color</div>
          <small class="text-muted-foreground"
            >It will be applied to the header navbar so you can distinguish this connection from
            other ones.</small
          >
        </div>
        <div class="flex-1">
          <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
            <button
              v-for="(color, index) in colors"
              :key="color"
              :aria-label="`Pick the color ${color}`"
              :aria-pressed="environment.color === color ? 'true' : 'false'"
              class="min-h-10 cursor-pointer rounded-md text-center text-sm uppercase leading-10 text-white"
              :class="`CreateEnvironment-box EnvColor--${color}`"
              :data-cy="`EnvColor--${color}`"
              type="button"
              @click="selectColor(index)"
            >
              <span v-if="environment.color === color">Selected</span>
            </button>
          </div>
          <FormMessage v-if="colorState === false" class="mt-2">
            You must select a color for this connection
          </FormMessage>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
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
import { useToast } from '@/composables/useToast';
import { caught } from '@/lib/errors';
import { logger } from '@/plugins/logger';
import { useKuzzleStore } from '@/stores';
import type { EnvironmentColor } from '@/stores/types/kuzzle';
import { DEFAULT_COLOR, ENV_COLORS, NO_ADMIN_WARNING_HOSTS } from '@/utils';
import { isValidHostname, notIncludeScheme } from '@/validators';

const useHttps = window.location.protocol === 'https:';

type Field = 'backendMajorVersion' | 'color' | 'host' | 'name' | 'port';

const FIELDS: Field[] = ['name', 'host', 'port', 'color', 'backendMajorVersion'];

// Le formulaire, pas encore une connexion : la couleur et la version sont
// vides tant qu'elles ne sont pas choisies, et le port est saisi en texte.
interface EnvironmentForm {
  backendMajorVersion: number | null;
  color: EnvironmentColor | null;
  hideAdminWarning: boolean;
  host: string;
  name: string;
  port: number | string;
  ssl: boolean;
}

const props = withDefaults(
  defineProps<{
    environmentId?: string | null;
  }>(),
  { environmentId: null },
);

const kuzzleStore = useKuzzleStore();
const toast = useToast();

const majorVersions = [
  { value: 1, text: 'v1.x' },
  {
    value: 2,
    text: 'v2.x',
  },
];
const environment = reactive<EnvironmentForm>({
  name: '',
  host: '',
  port: 7512,
  color: null,
  ssl: useHttps,
  backendMajorVersion: null,
  hideAdminWarning: false,
});
const submitting = ref(false);

const colors = ENV_COLORS;
const environments = computed(() => kuzzleStore.environments);

/*
 * Le validateur lisait `this.environmentId` et `this.environments` : en
 * Options API, Vuelidate l'appelle avec le composant pour contexte. Ici il
 * lit les mêmes valeurs par fermeture.
 */
function nameIsUnique(value: unknown): boolean {
  if (props.environmentId) {
    return true;
  }

  return !Object.keys(environments.value).includes(String(value));
}

const rules = {
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
      isValidColor: helpers.withMessage('You must select a valid color', (color: unknown) =>
        ENV_COLORS.some((valid) => valid === color),
      ),
    },
    backendMajorVersion: {
      required: helpers.withMessage('You must select a backend version', required),
    },
  },
};

const v$ = useVuelidate(rules, { environment });

function feedback(field: Field): string | null {
  const errors = v$.value.environment[field].$errors;
  return errors.length > 0 ? String(errors[0].$message) : null;
}

const nameFeedback = computed(() => feedback('name'));
const hostFeedback = computed(() => feedback('host'));
const portFeedback = computed(() => feedback('port'));
const sslFeedback = computed((): string => {
  if (useHttps && !environment.ssl) {
    return `You are
          using an Admin Console served via HTTPs. Your browser might refuse to
          open an unsecure connection to Kuzzle`;
  }

  if (environment.ssl) {
    return `Please ensure your Kuzzle instance supports secure Websocket connections`;
  }

  return '';
});
const versionFeedback = computed(() => feedback('backendMajorVersion'));
const colorState = computed((): boolean | null => {
  const { $dirty, $error } = v$.value.environment.color;
  return $dirty ? !$error : null;
});

/*
 * `aria-invalid` à trois états, comme le `:state` de `b-input` : absent tant
 * que le champ n'a pas été touché, `"true"` s'il est en erreur, `"false"`
 * s'il est valide — `Input` affiche alors la bordure verte (E-08).
 */
function fieldState(field: Field): string | undefined {
  const { $dirty, $error } = v$.value.environment[field];
  return $dirty ? String($error) : undefined;
}

function showValidationErrors(): void {
  v$.value.environment.$touch();
  FIELDS.forEach((field) => {
    if (v$.value.environment[field].$errors.length === 0) {
      v$.value.environment[field].$reset();
    }
  });
}

function checkSSL(): void {
  if (environment.port === 443) {
    environment.ssl = true;
  }
}

/*
 * Rend l'identifiant de la connexion créée ou mise à jour, ou `undefined` si
 * le formulaire est invalide ou que le store refuse. Appelée par les deux
 * parents, par leur référence.
 */
function submit(): string | undefined {
  v$.value.environment.$touch();
  if (v$.value.environment.$errors.length > 0) {
    return;
  }
  submitting.value = true;
  try {
    if (props.environmentId) {
      return kuzzleStore.updateEnvironment({
        id: props.environmentId,
        environment: {
          name: environment.name,
          color: environment.color,
          host: environment.host,
          port: parseInt(String(environment.port)),
          ssl: environment.ssl,
          backendMajorVersion: environment.backendMajorVersion,
          hideAdminWarning: environment.hideAdminWarning,
        },
      });
    } else {
      // Toutes deux requises : la validation ci-dessus les garantit.
      const { backendMajorVersion, color } = environment;
      if (color === null || backendMajorVersion === null) {
        return;
      }
      return kuzzleStore.createEnvironment({
        id: environment.name,
        environment: {
          name: environment.name,
          color,
          host: environment.host,
          port: parseInt(String(environment.port)),
          ssl: environment.ssl,
          backendMajorVersion,
          hideAdminWarning: !!NO_ADMIN_WARNING_HOSTS.includes(environment.host),
        },
      });
    }
  } catch (error) {
    const { message } = caught(error);
    logger.error(message);
    toast.warning('Ooops! Something went wrong while creating the new environment.', message);
  }
  submitting.value = false;
}

// Le `Select` rend une valeur de `reka-ui` (`AcceptableValue`) : ses options
// sont les nombres de `majorVersions`, rien d'autre ne peut en sortir.
function onVersionSelect(value: unknown): void {
  if (typeof value === 'number') {
    v$.value.environment.backendMajorVersion.$model = value;
  }
}

function selectColor(index: number): void {
  v$.value.environment.color.$model = colors[index];
}

onMounted(() => {
  const currentEnv = props.environmentId ? environments.value[props.environmentId] : undefined;
  if (props.environmentId && currentEnv) {
    environment.name = currentEnv.name;
    environment.host = currentEnv.host;
    environment.port = currentEnv.port;
    environment.color = currentEnv.color;
    environment.ssl = currentEnv.ssl;
    environment.backendMajorVersion = currentEnv.backendMajorVersion;
    environment.hideAdminWarning = currentEnv.hideAdminWarning;
    nextTick(() => showValidationErrors());
  } else {
    environment.name = '';
    environment.host = '';
    environment.port = 7512;
    environment.color = DEFAULT_COLOR;
    environment.ssl = useHttps;
    environment.backendMajorVersion = 2;
    environment.hideAdminWarning = false;
  }
});

defineExpose({ submit });
</script>
