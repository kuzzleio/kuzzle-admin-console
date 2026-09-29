<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl">
      <DialogHeader>
        <DialogTitle> {{ environmentId ? 'Update' : 'Create' }} Connection </DialogTitle>
      </DialogHeader>

      <create-environment
        ref="createEnvironmentComponent"
        :environment-id="environmentId"
        @environment::importEnv="importEnv"
      />

      <DialogFooter>
        <Button variant="outline" @click="close"> Cancel </Button>
        <Button data-cy="EnvironmentCreateModal-submit" @click="submit"> OK </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import CreateEnvironment from './CreateEnvironment.vue';

withDefaults(
  defineProps<{
    environmentId?: string | null;
    open?: boolean;
  }>(),
  { environmentId: null, open: false },
);

const emit = defineEmits<{
  (e: 'environment::importEnv'): void;
  (e: 'update:open', open: boolean): void;
}>();

const createEnvironmentComponent = useTemplateRef<InstanceType<typeof CreateEnvironment>>(
  'createEnvironmentComponent',
);

function close(): void {
  emit('update:open', false);
}

function importEnv(): void {
  close();
  emit('environment::importEnv');
}

function submit(): void {
  const submitted = createEnvironmentComponent.value?.submit();

  nextTick(() => {
    if (submitted) {
      close();
    }
  });
}
</script>
