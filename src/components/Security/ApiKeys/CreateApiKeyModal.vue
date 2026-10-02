<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <!--
      Une fois le jeton affiché, la fenêtre ne se ferme ni d'un clic à côté,
      ni d'Échap, ni par la croix : seulement par le bouton qui dit qu'il est
      copié (ADR-0070). Il ne sera plus jamais affiché.
    -->
    <DialogContent
      data-cy="CreateApiKey"
      :show-close-button="!token"
      @escape-key-down="token && $event.preventDefault()"
      @interact-outside.prevent
    >
      <template v-if="!token">
        <DialogHeader>
          <DialogTitle>Create an API key</DialogTitle>
          <DialogDescription>
            The key authenticates as <span class="code">{{ ownerLabel }}</span
            >, with the same rights.
          </DialogDescription>
        </DialogHeader>

        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <FormItem>
            <Label for="api-key-description">Description</Label>
            <Input
              id="api-key-description"
              v-model="description"
              :aria-describedby="descriptionError ? 'api-key-description-error' : undefined"
              :aria-invalid="descriptionError ? 'true' : undefined"
              data-cy="CreateApiKey-description"
              placeholder="What will use this key?"
            />
            <FormMessage v-if="descriptionError" id="api-key-description-error">
              {{ descriptionError }}
            </FormMessage>
          </FormItem>

          <FormItem>
            <Label id="api-key-expiration-label">Expiration</Label>
            <Select v-model="expiresIn">
              <SelectTrigger
                aria-labelledby="api-key-expiration-label"
                data-cy="CreateApiKey-expiration"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="expiration of EXPIRATIONS"
                  :key="expiration.value"
                  :value="expiration.value"
                >
                  {{ expiration.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>

          <Alert
            v-if="expiresIn === '-1'"
            data-cy="CreateApiKey-noExpirationWarning"
            variant="warning"
          >
            A key without expiration stays valid until it is revoked. Prefer a key that expires, and
            create a new one when it does.
          </Alert>
        </form>

        <DialogFooter>
          <Button variant="outline" @click="close">Cancel</Button>
          <Button data-cy="CreateApiKey-submit" :disabled="submitting" @click="submit">
            Create
          </Button>
        </DialogFooter>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle>Copy your API key</DialogTitle>
          <DialogDescription>
            This is the only time the key is shown. Store it somewhere safe: once this window is
            closed, it cannot be displayed again.
          </DialogDescription>
        </DialogHeader>

        <div class="flex items-stretch gap-2">
          <code
            class="min-w-0 flex-1 rounded-md border border-border bg-muted px-3 py-2 font-mono text-sm break-all"
            data-cy="CreateApiKey-token"
            >{{ token }}</code
          >
          <Button
            :aria-label="copied ? 'Copied' : 'Copy the API key'"
            data-cy="CreateApiKey-copy"
            variant="outline"
            @click="copy"
          >
            <i aria-hidden="true" :class="copied ? 'fas fa-check' : 'far fa-copy'" />
            {{ copied ? 'Copied' : 'Copy' }}
          </Button>
        </div>

        <DialogFooter>
          <Button data-cy="CreateApiKey-done" @click="close">I've copied it</Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

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
import { FormItem, FormMessage } from '@/components/ui/form';
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
import { logger } from '@/lib/logger';
import {
  type ApiKeyScope,
  createApiKey,
  DEFAULT_EXPIRATION,
  EXPIRATIONS,
  type Expiration,
} from '@/services/apiKeys';
import { useKuzzleStore } from '@/stores';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    ownerLabel: string;
    scope: ApiKeyScope;
  }>(),
  { open: false },
);

const emit = defineEmits<{
  (e: 'created'): void;
  (e: 'update:open', open: boolean): void;
}>();

const kuzzleStore = useKuzzleStore();
const toast = useToast();

const description = ref('');
const expiresIn = ref<Expiration>(DEFAULT_EXPIRATION);
const submitted = ref(false);
const submitting = ref(false);
const copied = ref(false);
/* Le jeton ne vit qu'ici, le temps que la fenêtre est ouverte : ni store, ni
   `localStorage`, ni toast, ni log. Il est oublié à la fermeture. */
const token = ref<string | null>(null);

const descriptionError = computed(() =>
  submitted.value && description.value.trim() === '' ? 'A description is required' : null,
);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      description.value = '';
      expiresIn.value = DEFAULT_EXPIRATION;
      submitted.value = false;
      submitting.value = false;
      copied.value = false;
      token.value = null;
    }
  },
);

function close(): void {
  emit('update:open', false);
}

function onOpenChange(open: boolean): void {
  // La croix et Échap sont désactivées une fois le jeton affiché ; on ne se
  // fie pas qu'à elles.
  if (!open && token.value) {
    return;
  }
  emit('update:open', open);
}

async function submit(): Promise<void> {
  submitted.value = true;
  if (descriptionError.value || submitting.value) {
    return;
  }

  submitting.value = true;
  try {
    const sdk = kuzzleStore.$kuzzle;
    if (!sdk) {
      throw new Error('No Kuzzle SDK for the current environment');
    }
    const created = await createApiKey(sdk, props.scope, description.value.trim(), expiresIn.value);
    token.value = created.token;
    emit('created');
  } catch (error) {
    // L'erreur vient de la requête, qui n'a pas rendu de jeton : elle peut
    // être journalisée.
    logger.error(error);
    toast.danger('Unable to create the API key', caught(error).message);
  } finally {
    submitting.value = false;
  }
}

async function copy(): Promise<void> {
  if (!token.value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(token.value);
    copied.value = true;
  } catch {
    toast.warning('Unable to copy the API key', 'Select it and copy it by hand.');
  }
}
</script>
