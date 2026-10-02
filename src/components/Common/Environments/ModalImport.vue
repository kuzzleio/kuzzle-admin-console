<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent data-cy="EnvironmentImport">
      <DialogHeader>
        <DialogTitle>Import Connection</DialogTitle>
      </DialogHeader>

      <div class="flex flex-col gap-1.5">
        <Label for="env-import-file">Upload a file</Label>
        <FileInput
          id="env-import-file"
          ref="file-input"
          accept=".json"
          data-cy="EnvironmentImport-fileInput"
          @change="onFileChange"
        />
        <DialogDescription> You can drag and drop your file in this input field </DialogDescription>
      </div>

      <Alert
        v-if="file !== null && errors.length === 0 && !loading"
        data-cy="EnvironmentImport-ok"
        variant="success"
      >
        ✅ Uploaded file is valid. Found {{ envNames.length }} connections.
      </Alert>

      <!--
        `b-alert dismissible` posait sa croix ; `Alert` n'en rend pas, elle est
        écrite ici comme dans `Login/Form.vue`. Fermer une erreur la masque
        sans la retirer de `errors` : le fichier reste invalide, et
        « Uploaded file is valid » ne doit pas apparaître (E-11).
      -->
      <template v-for="(err, k) in errors" :key="k">
        <Alert
          v-if="!dismissedErrors.includes(k)"
          class="flex items-start gap-3"
          data-cy="EnvironmentImport-err"
          variant="destructive"
        >
          <span class="flex-1">{{ err }}</span>
          <button
            aria-label="Dismiss"
            class="cursor-pointer leading-none"
            data-cy="EnvironmentImport-errDismiss"
            type="button"
            @click="dismissedErrors.push(k)"
          >
            <i class="fa fa-times" aria-hidden="true" />
          </button>
        </Alert>
      </template>

      <DialogFooter>
        <Button variant="outline" @click="close"> Cancel </Button>
        <Button
          data-cy="EnvironmentImport-submitBtn"
          :disabled="envNames.length === 0"
          @click="importEnv"
        >
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import { omit } from 'lodash';
import { useRouter } from 'vue-router';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileInput } from '@/components/ui/file-input';
import { Label } from '@/components/ui/label';
import { logger } from '@/lib/logger';
import { useKuzzleStore } from '@/stores';
import type { Environment } from '@/stores/types/kuzzle';
import { ENVIRONMENT_SESSION_FIELDS } from '@/utils';

const props = withDefaults(
  defineProps<{
    open?: boolean;
  }>(),
  { open: false },
);

const emit = defineEmits<{
  (e: 'update:open', open: boolean): void;
}>();

const kuzzleStore = useKuzzleStore();
const router = useRouter();

const fileInput = useTemplateRef<InstanceType<typeof FileInput>>('file-input');

// Le contenu du fichier importé n'est pas validé — il ne l'était pas
// davantage avec `b-form-file`. Le typer en `Environment` dit ce qu'on en
// attend, pas ce qu'on a vérifié. À reprendre le jour où l'import sera
// validé pour de bon.
const dismissedErrors = ref<number[]>([]);
const env = ref<Record<string, Environment>>({});
const errors = ref<string[]>([]);
const file = ref<File | null>(null);
const loading = ref(false);

const envNames = computed(() => Object.keys(env.value));

function close(): void {
  emit('update:open', false);
}

function clearFiles(): void {
  fileInput.value?.reset();
  file.value = null;
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  file.value = input.files && input.files.length > 0 ? input.files[0] : null;
}

function reset(): void {
  clearFiles();
  errors.value = [];
  dismissedErrors.value = [];
  env.value = {};
  loading.value = false;
}

async function importEnv(): Promise<void> {
  let mustSwitch = false;
  if (Object.keys(kuzzleStore.environments).length === 0) {
    mustSwitch = true;
  }
  for (const name in env.value) {
    try {
      // Un fichier d'environnements ne transporte pas de session : un token
      // importé l'ouvrirait sans identifiants (ADR-0064).
      kuzzleStore.createEnvironment({
        id: name,
        environment: omit(env.value[name], ENVIRONMENT_SESSION_FIELDS),
      });
    } catch (e) {
      logger.error(e);
      errors.value.push(String(e));
    }
  }
  if (!errors.value.length) {
    logger.debug(`Finished import must switch: ${mustSwitch}, env:`);
    logger.debug(kuzzleStore.environments);
    router.push({ name: 'SelectEnvironment' });
    close();
  }
}

function upload(): void {
  if (!file.value || loading.value) {
    return;
  }
  logger.debug('Uploading!');

  errors.value = [];
  dismissedErrors.value = [];
  env.value = {};
  loading.value = true;
  const reader = new FileReader();

  if (file.value.type !== 'application/json') {
    errors.value.push(
      `⛔️ Uploaded file type (${file.value.type}) is not supported. Please import .json files only`,
    );
    loading.value = false;
    return;
  }

  reader.onload = (e: ProgressEvent<FileReader>) => {
    try {
      env.value = JSON.parse(String(e.target?.result ?? ''));
    } catch (error) {
      logger.error(error);
      logger.debug(e.target);
      errors.value.push(String(error));
    }
    loading.value = false;
  };

  reader.readAsText(file.value);
}

watch(file, () => {
  logger.debug('File has changed');
  upload();
});

// Remplace les trois écouteurs `@cancel` / `@close` / `@hide` de `b-modal`.
watch(
  () => props.open,
  (open) => {
    if (!open) {
      reset();
    }
  },
);
</script>
