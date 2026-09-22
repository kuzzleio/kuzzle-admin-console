<template>
  <ToastViewport label="Notifications">
    <Toast
      v-for="toast of toasterStore.toasts"
      :key="toast.id"
      class="flex-row items-start gap-3"
      :data-cy="`Toast--${toast.variant}`"
      :variant="toast.variant"
    >
      <div class="min-w-0 flex-1">
        <ToastTitle>{{ toast.title }}</ToastTitle>
        <ToastDescription v-if="toast.message">{{ toast.message }}</ToastDescription>

        <div v-if="toast.actions.length" class="mt-2 flex flex-wrap gap-2">
          <Button
            v-for="action of toast.actions"
            :key="action.label"
            size="sm"
            :variant="action.variant || 'default'"
            @click="runAction(toast.id, action)"
          >
            {{ action.label }}
          </Button>
        </div>
      </div>
      <ToastClose @click="toasterStore.dismiss(toast.id)" />
    </Toast>
  </ToastViewport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToasterStore } from '@/stores';

/*
 * La zone de notifications de la console.
 *
 * Ce n'est pas une primitive : c'est la composition que `bootstrap-vue`
 * fabriquait toute seule au premier `$bvToast.toast()`, et qu'il faut
 * désormais monter explicitement — une fois, dans `App.vue` (ADR-0020).
 *
 * Les minuteries vivent ici et non dans le store : un store n'a pas à
 * connaître `setTimeout`, et une minuterie qui survit au démontage du
 * composant est une fuite. Elles sont annulées à la destruction.
 */
export default defineComponent({
  name: 'Toaster',
  components: {
    Button,
    Toast,
    ToastClose,
    ToastDescription,
    ToastTitle,
    ToastViewport,
  },
  setup() {
    return {
      toasterStore: useToasterStore(),
    };
  },
  data() {
    return {
      timers: new Map<number, ReturnType<typeof setTimeout>>(),
    };
  },
  watch: {
    'toasterStore.toasts': {
      immediate: true,
      handler(toasts: Array<{ autoHideAfter: number | null; id: number }>) {
        for (const toast of toasts) {
          if (toast.autoHideAfter === null || this.timers.has(toast.id)) {
            continue;
          }

          this.timers.set(
            toast.id,
            setTimeout(() => {
              this.timers.delete(toast.id);
              this.toasterStore.dismiss(toast.id);
            }, toast.autoHideAfter),
          );
        }

        /* Un toast fermé à la main emporte sa minuterie. */
        const alive = new Set(toasts.map((toast) => toast.id));
        for (const [id, timer] of this.timers) {
          if (!alive.has(id)) {
            clearTimeout(timer);
            this.timers.delete(id);
          }
        }
      },
    },
  },
  methods: {
    /* Une action ferme le toast : c'est ce que faisaient les deux bandeaux. */
    runAction(id: number, action: { handler: () => void }): void {
      action.handler();
      this.toasterStore.dismiss(id);
    },
  },
  beforeDestroy() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  },
});
</script>
