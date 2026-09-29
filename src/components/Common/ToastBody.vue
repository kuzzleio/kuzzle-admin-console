<template>
  <div class="flex flex-col gap-2">
    <p v-if="message || link" class="m-0">
      {{ message }}
      <a v-if="link" class="font-semibold underline" :href="link.href">{{ link.label }}</a>
    </p>
    <div v-if="actions.length" class="flex flex-wrap gap-2">
      <Button
        v-for="action of actions"
        :key="action.label"
        size="sm"
        :title="action.title"
        :variant="action.variant || 'default'"
        @click="run(action)"
      >
        {{ action.label }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import type { ToastAction, ToastLink } from '@/stores/types/toaster';

/*
 * Le corps d'un toast : message, lien et actions (ADR-0058).
 *
 * `vue-sonner` rend une `action` dans son propre `<button>`, qui n'a ni
 * variante, ni infobulle, et qui ne sait en afficher que deux (`action` et
 * `cancel`). La description, elle, accepte un composant : les actions y
 * vivent, avec le `Button` de la console. Une action ferme le toast, comme
 * le faisaient les deux bandeaux (ADR-0020).
 */
const props = defineProps<{
  actions: ToastAction[];
  link: ToastLink | null;
  message: string;
  toastId: number;
}>();

function run(action: ToastAction): void {
  action.handler();
  toast.dismiss(props.toastId);
}
</script>
