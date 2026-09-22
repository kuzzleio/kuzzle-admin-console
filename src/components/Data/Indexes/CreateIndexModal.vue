<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl" labelled-by="create-index-title">
      <DialogHeader>
        <DialogTitle id="create-index-title">Index creation</DialogTitle>
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
          <FormDescription v-else>
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

<script lang="ts">
import { defineComponent } from 'vue';
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
import { useStorageIndexStore } from '@/stores';
import { startsWithSpace, isWhitespace, isUppercase } from '@/validators';

function includesInvalidIndexChars(value: string): boolean {
  // eslint-disable-next-line no-useless-escape
  return /[@\\\/\*\?"<>,#:%&\|\.]/.test(value);
}

export default defineComponent({
  name: 'CreateIndexModal',
  components: {
    Alert,
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormDescription,
    FormItem,
    FormMessage,
    Input,
    Label,
    Spinner,
  },
  // Pas d'`autofocus` : `DialogContent` pose le focus sur le premier élément
  // focalisable à l'ouverture, et c'est ce champ. L'attribut natif, lui, n'est
  // pas rejoué quand le nœud est déplacé dans `<body>` (G-012).
  props: {
    open: {
      default: false,
      type: Boolean,
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      error: '',
      index: '',
      modalBusy: false,
    };
  },
  validations() {
    return {
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
  },
  computed: {
    indexFeedback(): string | null {
      if (this.v$.index.$errors.length > 0) {
        return this.v$.index.$errors[0].$message as string;
      }

      return null;
    },
  },
  watch: {
    // Remplace `@hide` de `b-modal` : la fermeture est un seul état, quelle que
    // soit la façon dont elle arrive.
    open(open: boolean) {
      if (!open) {
        this.resetForm();
      }
    },
  },
  methods: {
    close(): void {
      this.$emit('update:open', false);
    },
    resetForm(): void {
      this.v$.$reset();
      this.index = '';
      this.error = '';
      this.modalBusy = false;
    },
    async tryCreateIndex(): Promise<void> {
      this.v$.$touch();
      if (this.v$.$errors.length > 0) {
        return;
      }

      this.modalBusy = true;

      try {
        await this.storageIndexStore.createIndex(this.index);
        this.close();
        this.$emit('create-successful');
      } catch (err) {
        this.error = (err as Error).message;
        this.modalBusy = false;
      }
    },
  },
});
</script>
