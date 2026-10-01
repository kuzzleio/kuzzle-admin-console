<template>
  <div class="CollectionCreateOrUpdate flex h-full flex-col">
    <headline>
      <span class="code text-muted-foreground">
        {{ index }}
        <i class="fa fa-angle-right" />
      </span>
      {{ headline }}
    </headline>

    <Card class="min-h-0 grow shadow-signature">
      <CardContent class="flex min-h-0 grow flex-col gap-4">
        <FormItem id="collection-name" data-cy="CollectionCreateOrUpdate-name">
          <Label for="collection-name-input">Collection name</Label>
          <Input
            id="collection-name-input"
            v-model="v$.name.$model"
            :aria-invalid="isNameInvalid ? 'true' : undefined"
            :disabled="!!collection"
            name="collection"
            tabindex="1"
            type="text"
          />
          <FormMessage v-if="isNameInvalid && v$.name.required.$invalid">
            Please fill-in a valid collection name.
          </FormMessage>
          <FormMessage v-else-if="isNameInvalid && v$.name.isValidCollectionName.$invalid">
            The name you entered is invalid.
            <!--
              Sans preflight, un `<a>` garde la couleur de lien de Bootstrap :
              dans un message d'erreur, elle jure et ne se distingue plus du
              texte. Le lien hérite de la couleur du message et se signale par
              son soulignement.
            -->
            <a
              class="text-inherit underline underline-offset-4"
              href="https://docs.kuzzle.io/core/2/api/controllers/collection/create/"
              target="_blank"
              >Read more about how to choose a valid name</a
            >
          </FormMessage>
          <FormDescription>
            <span v-if="collection">This field cannot be updated</span>
            <span v-else>This field is mandatory</span>
          </FormDescription>
        </FormItem>

        <div class="flex flex-wrap items-center gap-3">
          <FileInput
            id="collection-mapping-import"
            accept=".json"
            aria-label="Import mappings"
            class="w-96"
            placeholder="Select a JSON file to import mappings.."
            @change="loadMappingValue($event)"
          />

          <!--
            `disabled` n'a aucun effet sur un `<a>` (G-016) : quand le mapping
            n'est pas un JSON valide, il n'y a rien à télécharger et le bouton
            est rendu en `<button disabled>`, que le navigateur sait rendre
            inerte.
          -->
          <Button
            :as="isMappingValid ? 'a' : 'button'"
            data-cy="export-collection-mapping"
            :disabled="!isMappingValid"
            :download="isMappingValid ? mappingFileName : undefined"
            :href="isMappingValid ? downloadMappingValue : undefined"
            variant="outline"
          >
            Export Mapping
          </Button>
        </div>

        <div class="flex min-h-0 grow flex-col gap-4 lg:flex-row">
          <div class="flex min-h-0 flex-col gap-2 lg:w-8/12">
            <!--
              La validation refusait déjà un JSON invalide, mais rien ne le disait :
              le bouton semblait ne rien faire (#1027, porté de #1092).
            -->
            <FormMessage
              v-if="v$.rawMapping.$errors.length > 0"
              data-cy="CollectionCreateOrUpdate-jsonEditor--dangerIcon"
            >
              Invalid JSON. Fix the syntax before submitting.
            </FormMessage>
            <json-editor
              id="collection"
              ref="jsoneditor"
              class="grow"
              :content="state.rawMapping"
              tabindex="4"
              @change="onMappingChanged"
            />
          </div>

          <!--
            Pas de `flex flex-col` sur ce bloc : il mêle du texte et des
            éléments en ligne, que la colonne casserait ligne à ligne (G-018).
          -->
          <div class="min-h-0 overflow-auto text-muted-foreground lg:w-4/12">
            You can (optionally) use this editor to define the mappings for this collection.
            <br />
            The mappings of a collection is the definition of how each document in the collection
            (and its fields) are stored and indexed.
            <a
              class="text-primary underline underline-offset-4 hover:text-primary-hover"
              href="https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-policy"
              target="_blank"
              >Read more about mappings</a
            >
            <br /><br />
            For example:
            <pre>
{
  "properties": {
    "age": { "type": "integer" },
    "name": { "type": "keyword" }
  }
}</pre
            >
          </div>
        </div>
      </CardContent>

      <CardFooter class="justify-end gap-2">
        <Button
          :as="RouterLink"
          :to="{ name: 'Collections', params: { indexName: index } }"
          variant="outline"
          >Cancel</Button
        >
        <Button data-cy="CollectionCreateOrUpdate-submit" @click="handleSubmit">
          {{ submitLabel }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, useTemplateRef, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { requiredUnless } from '@vuelidate/validators';
import { RouterLink, useRoute } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/composables/useToast';
import { logger } from '@/lib/logger';
import { useKuzzleStore } from '@/stores';

import JsonEditor from '@/components/Common/JsonEditor.vue';
import Headline from '@/components/Materialize/Headline.vue';

function isValidCollectionName(value: string): boolean {
  const containsDisallowed = /\\\\|\/|\*|\?|"|<|>|\||\s|,|#|:|%|&|\./.test(value);
  const containsUpperCase = /[A-Z]/.test(value);
  const isTooLong = new TextEncoder().encode(value).length > 128;
  return !containsDisallowed && !containsUpperCase && !isTooLong;
}

function isJson(value: string): boolean {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}

const props = withDefaults(
  defineProps<{
    collection?: string;
    headline?: string;
    index: string;
    mapping?: Record<string, unknown>;
    submitLabel?: string;
  }>(),
  {
    collection: undefined,
    headline: undefined,
    mapping: () => ({
      properties: {},
    }),
    submitLabel: 'OK',
  },
);

const emit = defineEmits<{
  (e: 'submit', payload: { name: string; mapping: object }): void;
}>();

const route = useRoute();
const toast = useToast();
const kuzzleStore = useKuzzleStore();

const jsoneditor = useTemplateRef<InstanceType<typeof JsonEditor>>('jsoneditor');

// Un objet réactif et non des `ref` : `$model` a alors le type du champ.
const state = reactive({
  name: props.collection || '',
  rawMapping: '{}',
});

const rules = {
  name: {
    required: requiredUnless(() => !!props.collection),
    isValidCollectionName,
  },
  rawMapping: {
    syntaxOK: isJson,
  },
};

const v$ = useVuelidate(rules, state);

function routeParam(name: string): string | undefined {
  const value = route.params[name];
  return typeof value === 'string' ? value : undefined;
}

const mappingFileName = computed(
  (): string =>
    `${kuzzleStore.currentEnvironment?.name}-${routeParam('indexName')}-${state.name}-mapping.json`,
);

// `b-form-group` n'affichait ses messages que si `state` valait `false` ;
// le champ n'est donc en erreur qu'une fois touché. `Input` n'a pas de prop
// `state` : l'information passe par `aria-invalid`, et c'est le site
// d'appel qui met le message sous `v-if` (FormMessage).
const isNameInvalid = computed((): boolean => {
  const { $dirty, $error } = v$.value.name;
  return $dirty && $error;
});

const mappingState = computed((): object => {
  try {
    return JSON.parse(state.rawMapping);
  } catch (error) {
    return {};
  }
});

const isMappingValid = computed((): boolean => isJson(state.rawMapping));

const downloadMappingValue = computed((): string | null => {
  if (isMappingValid.value) {
    const blob = new Blob([JSON.stringify(JSON.parse(state.rawMapping))], {
      type: 'application/json',
    });
    return window.URL.createObjectURL(blob);
  }
  return null;
});

watch(
  () => props.mapping,
  (val) => {
    try {
      state.rawMapping = JSON.stringify(val, null, 2);
    } catch (error) {
      logger.error(error);
    }
  },
  { immediate: true },
);

watch(
  () => props.collection,
  (v) => {
    state.name = v ?? '';
  },
  { immediate: true },
);

function loadMappingValue(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.files) {
    return;
  }

  const file = target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    state.rawMapping = typeof reader.result === 'string' ? reader.result : '';
    jsoneditor.value?.setContent(state.rawMapping);
    toast.success(
      'Import successfully',
      'The file has been written in the json editor. You can still edit it before saving if necessary.',
    );
  };
  reader.readAsText(file);
}

function onMappingChanged(value: string): void {
  state.rawMapping = value;
}

function handleSubmit(): void {
  v$.value.$touch();
  if (v$.value.$errors.length > 0) {
    return;
  }

  if (!isMappingValid.value) {
    toast.info(
      'You cannot proceed',
      'The JSON specification of the mapping contains syntax errors',
    );
  }

  emit('submit', {
    name: state.name,
    mapping: mappingState.value,
  });
}
</script>
