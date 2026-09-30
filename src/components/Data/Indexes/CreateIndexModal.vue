<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Index creation</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="tryCreateIndex">
        <FormItem data-cy="CreateIndexModal-name">
          <Label for="indexName">Index name</Label>
          <Input
            id="indexName"
            v-model="v$.index.$model"
            :aria-invalid="indexFeedback ? 'true' : undefined"
            required
            type="text"
          />
          <FormMessage v-if="indexFeedback">{{ indexFeedback }}</FormMessage>
          <!-- Toujours affichée : c'est quand la saisie est refusée qu'on a
               besoin de la liste des caractères interdits (E-08). -->
          <FormDescription>
            The index name should contain only lowercase characters and no spaces. It also must not
            contain de following characters: <code>\</code>, <code>/</code>, <code>*</code>,
            <code>?</code>, <code>"</code>, <code>&lt;</code>, <code>></code>, <code>|</code>,
            <code>,</code>, <code>#</code>, <code>:</code>, <code>%</code>, <code>&</code>,
            <code>.</code>
          </FormDescription>
        </FormItem>
        <Alert
          v-if="error"
          class="mt-4 overflow-auto"
          data-cy="CreateIndexModal-alert"
          variant="destructive"
          >{{ error }}</Alert
        >
      </form>

      <DialogFooter>
        <Spinner v-if="modalBusy" class="me-auto" label="Creating the index" />
        <Button variant="outline" :disabled="modalBusy" @click="close"> Cancel </Button>
        <Button data-cy="CreateIndexModal-createBtn" :disabled="modalBusy" @click="tryCreateIndex">
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { not, required, helpers } from '@vuelidate/validators';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { caught } from '@/lib/errors';
import { useStorageIndexStore } from '@/stores';
import { startsWithSpace, isWhitespace, isUppercase } from '@/validators';

function includesInvalidIndexChars(value: string): boolean {
  // eslint-disable-next-line no-useless-escape
  return /[@\\\/\*\?"<>,#:%&\|\.]/.test(value);
}

// Pas d'`autofocus` : `DialogContent` pose le focus sur le premier élément
// focalisable à l'ouverture, et c'est ce champ. L'attribut natif, lui, n'est
// pas rejoué quand le nœud est déplacé dans `<body>` (G-012).
const props = withDefaults(defineProps<{ open?: boolean }>(), { open: false });

const emit = defineEmits<{
  (e: 'create-successful'): void;
  (e: 'update:open', open: boolean): void;
}>();

const storageIndexStore = useStorageIndexStore();

const error = ref('');
const modalBusy = ref(false);

const rules = {
  index: {
    isNotWhitespace: helpers.withMessage(
      'This field cannot contain just whitespaces',
      not(isWhitespace),
    ),
    startsWithLetter: helpers.withMessage(
      'This field cannot start with a whitespace',
      not(startsWithSpace),
    ),
    isLowercase: helpers.withMessage(
      'This field cannot contain uppercase letters',
      not(isUppercase),
    ),
    required: helpers.withMessage('This field cannot be empty', required),
    validChars: helpers.withMessage(
      'This field cannnot contain invalid chars',
      not(includesInvalidIndexChars),
    ),
  },
};

// Un objet réactif et non un `ref` : `$model` a alors le type du champ.
const state = reactive({ index: '' });

const v$ = useVuelidate(rules, state);

const indexFeedback = computed((): string | null => {
  const errors = v$.value.index.$errors;
  return errors.length > 0 ? String(errors[0].$message) : null;
});

// Remplace `@hide` de `b-modal` : la fermeture est un seul état, quelle que
// soit la façon dont elle arrive.
watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetForm();
    }
  },
);

function close(): void {
  emit('update:open', false);
}

function resetForm(): void {
  v$.value.$reset();
  state.index = '';
  error.value = '';
  modalBusy.value = false;
}

async function tryCreateIndex(): Promise<void> {
  v$.value.$touch();
  if (v$.value.$errors.length > 0) {
    return;
  }

  modalBusy.value = true;

  try {
    await storageIndexStore.createIndex(state.index);
    close();
    emit('create-successful');
  } catch (err) {
    error.value = caught(err).message;
    modalBusy.value = false;
  }
}
</script>
