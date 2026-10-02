<template>
  <Dialog :open="!!apiKey" @update:open="!$event && emit('cancel')">
    <!-- `@interact-outside.prevent` : une révocation ne se ferme pas sur un clic à côté. -->
    <DialogContent data-cy="RevokeApiKey" @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle>Revoke the API key</DialogTitle>
        <DialogDescription v-if="apiKey">
          Revoke <span class="code">{{ apiKey.description }}</span
          >? Every application that uses this key will stop working. This cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="outline" @click="emit('cancel')">Cancel</Button>
        <Button
          data-cy="RevokeApiKey-submit"
          :disabled="revoking"
          variant="destructive"
          @click="apiKey && emit('confirm', apiKey)"
        >
          Revoke
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ApiKey } from '@/services/apiKeys';

withDefaults(
  defineProps<{
    /** La clé à révoquer ; la fenêtre est ouverte tant qu'il y en a une. */
    apiKey?: ApiKey | null;
    revoking?: boolean;
  }>(),
  { apiKey: null, revoking: false },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm', apiKey: ApiKey): void;
}>();
</script>
