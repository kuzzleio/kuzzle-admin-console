<template>
  <div
    class="EditUserMapping mx-auto flex h-full w-full max-w-6xl flex-col px-4"
    data-cy="EditUserMapping"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <Headline>Edit User Custom Data Mapping</Headline>
      <div class="flex flex-wrap items-center gap-3">
        <FileInput
          id="user-mapping-import"
          accept=".json"
          aria-label="Import mapping"
          class="w-72"
          placeholder="Import mapping"
          @change="loadMappingValue($event)"
        />
        <!--
          `as` bascule sur `button` quand l'export est impossible : un `<a>`
          ignore `disabled` et resterait cliquable (G-016).
        -->
        <Button
          :as="isMappingValid ? 'a' : 'button'"
          data-cy="export-user-mapping"
          :disabled="!isMappingValid"
          :download="
            isMappingValid ? `${kuzzleStore.currentEnvironment?.name}-user-mapping.json` : undefined
          "
          :href="isMappingValid ? downloadMappingValue : undefined"
          variant="outline"
        >
          Export Mapping
        </Button>
      </div>
    </div>

    <Alert class="my-3">
      Here, you will be able to define the fields to be included in Users' custom data payload.
    </Alert>

    <template v-if="!loading">
      <Card class="grow">
        <CardContent class="flex h-full flex-col gap-6 lg:flex-row">
          <div class="lg:w-8/12">
            <JsonEditor
              id="user-custom-data-mapping-editor"
              ref="jsoneditor"
              :content="mappingValue"
              data-cy="EditUserMapping-JSONEditor"
              myclass="h-full"
              tabindex="4"
              @change="onMappingChange"
            />
          </div>
          <div class="text-muted-foreground lg:w-4/12">
            Mapping is the process of defining how a document, and the fields it contains, are
            stored and indexed.
            <a
              class="text-primary underline underline-offset-4 hover:text-primary-hover"
              href="https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-policy"
              rel="noopener noreferrer"
              target="_blank"
              >Read more about mapping</a
            >
            <br />
            You should omit the root "properties" field in this form.
            <pre>
{
  "age": { "type": "integer" },
  "name": { "type": "text" }
}
            </pre>
          </div>
        </CardContent>

        <CardFooter class="justify-end gap-2">
          <Button variant="outline" @click="onCancel">Cancel</Button>
          <Button
            data-cy="EditUserMapping-submitBtn"
            :disabled="!isMappingValid"
            type="submit"
            @click="onSubmit"
          >
            Save
          </Button>
        </CardFooter>
      </Card>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * This feature is currently freezed.
 */
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import omit from 'lodash/omit';
import { useRouter } from 'vue-router';

import JsonEditor from '../../Common/JsonEditor.vue';
import Headline from '../../Materialize/Headline.vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { useToast } from '@/composables/useToast';
import { logger } from '@/lib/logger';
import { useKuzzleStore } from '@/stores';

const kuzzleStore = useKuzzleStore();
const router = useRouter();
const toast = useToast();

const jsoneditor = useTemplateRef<InstanceType<typeof JsonEditor>>('jsoneditor');

const mappingValue = ref('{}');
const loading = ref(false);

const isMappingValid = computed(() => {
  try {
    JSON.parse(mappingValue.value);
    return true;
  } catch {
    return false;
  }
});
const downloadMappingValue = computed(() => {
  if (isMappingValid.value) {
    const blob = new Blob([JSON.stringify(JSON.parse(mappingValue.value))], {
      type: 'application/json',
    });
    return window.URL.createObjectURL(blob);
  }
  return undefined;
});

/* Le wrapper de la connexion courante. Appelé dans un `try` ou un hook : son
   absence y est une erreur comme une autre. */
function wrapper() {
  const kuzzleWrapper = kuzzleStore.wrapper;
  if (!kuzzleWrapper) {
    throw new Error('No Kuzzle wrapper set for the current environment');
  }
  return kuzzleWrapper;
}

onMounted(async () => {
  loading.value = true;
  const result = await wrapper().getMappingUsers();
  mappingValue.value = JSON.stringify(omit(result.mapping, 'profileIds') || {}, null, 2);
  loading.value = false;
});

function loadMappingValue(event: Event): void {
  if (!(event.target instanceof HTMLInputElement) || !event.target.files) {
    return;
  }
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      return;
    }
    mappingValue.value = reader.result;
    jsoneditor.value?.setContent(mappingValue.value);
    toast.success(
      'Import successfully',
      'The file has been written in the json editor. You can still edit it before saving if necessary.',
    );
  };
  reader.readAsText(file);
}

function onMappingChange(value: string): void {
  mappingValue.value = value;
}

function onCancel(): void {
  router.push({ name: 'SecurityUsersList' });
}

async function onSubmit(): Promise<void> {
  try {
    await wrapper().updateMappingUsers(JSON.parse(mappingValue.value));
    router.push({ name: 'SecurityUsersList' });
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while updating the mapping',
      'The complete error has been printed to console',
    );
  }
}
</script>
