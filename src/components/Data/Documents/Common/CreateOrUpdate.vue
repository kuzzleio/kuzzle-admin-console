<template>
  <div class="DocumentCreateOrUpdate grow">
    <Card class="h-full shadow-signature">
      <CardContent class="flex h-full flex-col gap-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
          <FormItem class="lg:w-7/12">
            <Label for="document-id">Document ID</Label>
            <Input
              id="document-id"
              v-model="idValue"
              data-cy="DocumentCreate-input--id"
              :disabled="!!id"
            />
            <FormDescription v-if="!id">
              Leave blank to let Kuzzle auto-generate the ID
            </FormDescription>
          </FormItem>
          <UiSwitch v-model="formViewEnabled" data-cy="formView-switch">Form view</UiSwitch>
        </div>

        <!-- Form view-->
        <div v-if="formViewEnabled" class="flex min-h-0 flex-1 flex-col">
          <Alert
            v-if="formSchema.unavailable.length > 0"
            class="mb-4"
            data-cy="form-view-warning"
            variant="warning"
          >
            The following fields are not supported in the form view:
            <span class="font-semibold">{{ formSchema.unavailable.join(', ') }}</span
            >. Please use the JSON view if you want to update these values.
            <i
              id="supported-types-tooltip"
              class="fas fa-question-circle"
              :title="`The form view only supports these types: ${supportedTypes.join(', ')}.`"
            />
          </Alert>
          <DocumentForm :model="documentState" :schema="formSchema" @field-change="onFieldChange" />
        </div>
        <!-- Json view -->
        <div v-else class="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <div class="flex min-h-0 flex-col lg:w-7/12">
            <json-editor id="document" class="grow" :content="rawDocument" @change="onJsonChange" />
          </div>

          <!-- Mapping -->
          <div class="flex min-h-0 flex-col lg:w-5/12">
            <h3 class="text-title font-bold text-foreground">Mapping</h3>

            <JsonTree class="mb-0 min-h-0 flex-1 overflow-auto" :value="mapping" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="justify-end gap-2">
        <Button variant="outline" @click="$emit('cancel')">Cancel</Button>
        <Button
          v-if="!id"
          data-cy="DocumentCreate-btn"
          :disabled="submitting || !isDocumentValid"
          @click="submit()"
        >
          <i class="fa fa-plus-circle" />
          Create
        </Button>
        <Button
          v-if="!!id"
          data-cy="DocumentUpdate-btn"
          :disabled="submitting || !isDocumentValid"
          @click="submit()"
        >
          <i class="fa fa-pencil-alt" />
          Update
        </Button>
        <Button
          v-if="!!id"
          data-cy="DocumentReplace-btn"
          :disabled="submitting || !isDocumentValid"
          variant="warning"
          @click="submit(true)"
        >
          <i class="fa fa-fire-alt" />
          Replace
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FormDescription, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch as UiSwitch } from '@/components/ui/switch';
import { useToast } from '@/composables/useToast';
import { formSchemaService, typesCorrespondance } from '@/services/formSchema';

import JsonEditor from '@/components/Common/JsonEditor.vue';
import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';
import DocumentForm from './DocumentForm.vue';

/*
 * `index` et `collection` ne sont pas lus, mais les sites d'appel les passent :
 * déclarés, ils ne retombent pas en attributs sur la racine.
 */
const props = withDefaults(
  defineProps<{
    collection?: string;
    document?: object;
    id?: string;
    index?: string;
    mapping?: object | null;
  }>(),
  {
    collection: undefined,
    document: undefined,
    id: undefined,
    index: undefined,
    mapping: undefined,
  },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'document-change', document: Record<string, unknown>): void;
  (
    e: 'submit',
    document: Record<string, unknown>,
    id: string | number | undefined,
    replace: boolean,
  ): void;
}>();

const toast = useToast();

const idValue = ref<string | number | undefined>();
const submitting = ref(false);
const rawDocument = ref('{}');
const formViewEnabled = ref(false);

const documentState = computed((): Record<string, unknown> => {
  try {
    return JSON.parse(rawDocument.value);
  } catch (error) {
    return {};
  }
});

// `cleanMapping` rendait déjà `{}` d'un mapping absent (`_.omit(undefined)`).
const formSchema = computed(() =>
  formSchemaService.generate(props.mapping ?? {}, documentState.value),
);

const supportedTypes = computed((): string[] => Object.keys(typesCorrespondance));

const isDocumentValid = computed((): boolean => {
  try {
    JSON.parse(rawDocument.value);
    return true;
  } catch (error) {
    return false;
  }
});

watch(
  () => props.id,
  (val) => {
    idValue.value = val;
  },
  { immediate: true },
);

watch(
  () => props.document,
  (val) => {
    rawDocument.value = JSON.stringify(val, null, 2);
  },
  { immediate: true },
);

function onJsonChange(val: string): void {
  rawDocument.value = val;
  try {
    const parsed = JSON.parse(val);
    emit('document-change', parsed);
  } catch (error) {
    // Fail silently
  }
}

/*
 * Les deux vues lisent et écrivent `rawDocument` : c'est la seule source
 * de vérité du composant. `vue-form-generator` écrivait, lui, directement
 * dans l'objet reçu en prop, et la vue JSON ne se resynchronisait qu'en
 * repassant par le parent.
 */
function onFieldChange(field: string, value: unknown): void {
  const document = { ...documentState.value, [field]: value };
  rawDocument.value = JSON.stringify(document, null, 2);
  emit('document-change', document);
}

function submit(replace = false): void {
  if (submitting.value) {
    return;
  }

  if (isDocumentValid.value) {
    submitting.value = true;
    emit('submit', { ...documentState.value }, idValue.value, replace);
    submitting.value = false;
  } else {
    toast.info('You cannot proceed', 'The JSON specification of the document contains errors');
  }
}
</script>
