<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle>
          Environment <span class="code">{{ environmentName }}</span> deletion
        </DialogTitle>
      </DialogHeader>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="env-to-delete-name">
          Confirm environment name
        </label>
        <Input
          id="env-to-delete-name"
          v-model="envConfirmation"
          data-cy="EnvironmentDeleteModal-envName"
          @keydown.enter="confirmDeleteEnvironment"
        />
        <DialogDescription>This operation is not undoable.</DialogDescription>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close"> Cancel </Button>
        <Button
          data-cy="EnvironmentDeleteModal-submit"
          :disabled="!confirmationOk"
          @click="confirmDeleteEnvironment"
        >
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuthStore, useKuzzleStore } from '@/stores';

// `@interact-outside.prevent` sur le panneau : la suppression d'une connexion ne doit
// pas se fermer sur un clic à côté. Le geste est trop facile à faire par
// accident au milieu d'une saisie de confirmation.
const props = withDefaults(
  defineProps<{
    environmentId?: string | null;
    open?: boolean;
  }>(),
  { environmentId: null, open: false },
);

const emit = defineEmits<{
  (e: 'update:open', open: boolean): void;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const router = useRouter();

const envConfirmation = ref('');

const environmentName = computed((): string | null => {
  if (props.environmentId && kuzzleStore.environments[props.environmentId]) {
    return kuzzleStore.environments[props.environmentId].name;
  }
  return null;
});
const confirmationOk = computed(
  (): boolean => environmentName.value !== null && environmentName.value === envConfirmation.value,
);

// Remplace les trois écouteurs `@cancel` / `@close` / `@hide` de `b-modal` :
// la fermeture est un seul état, quelle que soit la façon dont elle arrive.
watch(
  () => props.open,
  (open) => {
    if (!open) {
      envConfirmation.value = '';
    }
  },
);

function close(): void {
  emit('update:open', false);
}

async function confirmDeleteEnvironment(): Promise<void> {
  if (!confirmationOk.value || !props.environmentId) {
    return;
  }

  if (kuzzleStore.currentId === props.environmentId && kuzzleStore.online) {
    await authStore.doLogout();
  }

  kuzzleStore.deleteEnvironment(props.environmentId);

  if (kuzzleStore.hasEnvironment) {
    router.push({ name: 'SelectEnvironment' });
  } else {
    router.push({ name: 'CreateEnvironment' });
  }

  close();
}
</script>
