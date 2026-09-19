<template>
  <Dialog :dismissible="false" :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent labelled-by="env-delete-title" described-by="env-delete-hint">
      <DialogHeader>
        <DialogTitle id="env-delete-title">
          Environment <span class="code">{{ environmentName }}</span> deletion
        </DialogTitle>
      </DialogHeader>

      <div class="tw:flex tw:flex-col tw:gap-1.5">
        <label class="tw:text-sm tw:font-medium" for="env-to-delete-name">
          Confirm environment name
        </label>
        <Input
          id="env-to-delete-name"
          v-model="envConfirmation"
          data-cy="EnvironmentDeleteModal-envName"
          @keydown.enter="confirmDeleteEnvironment"
        />
        <p id="env-delete-hint" class="tw:m-0 tw:text-sm tw:text-muted-foreground">
          This operation is not undoable.
        </p>
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

<script lang="ts">
import { defineComponent } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuthStore, useKuzzleStore } from '@/stores';

export default defineComponent({
  name: 'EnvironmentDeleteModal',
  components: {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
  },
  // `dismissible: false` sur le Dialog : la suppression d'une connexion ne doit
  // pas se fermer sur un clic à côté. Le geste est trop facile à faire par
  // accident au milieu d'une saisie de confirmation.
  props: {
    environmentId: {
      default: null,
      type: String,
    },
    open: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      envConfirmation: '',
    };
  },
  computed: {
    environments(): Record<string, { name: string }> {
      return this.kuzzleStore.environments;
    },
    confirmationOk(): boolean {
      return this.environmentName !== null && this.environmentName === this.envConfirmation;
    },
    environmentName(): string | null {
      if (this.environmentId && this.environments[this.environmentId]) {
        return this.environments[this.environmentId].name;
      }
      return null;
    },
  },
  setup() {
    return {
      authStore: useAuthStore(),
      kuzzleStore: useKuzzleStore(),
    };
  },
  watch: {
    // Remplace les trois écouteurs `@cancel` / `@close` / `@hide` de `b-modal` :
    // la fermeture est un seul état, quelle que soit la façon dont elle arrive.
    open(open: boolean) {
      if (!open) {
        this.envConfirmation = '';
      }
    },
  },
  methods: {
    close(): void {
      this.$emit('update:open', false);
    },
    async confirmDeleteEnvironment(): Promise<void> {
      if (!this.confirmationOk) {
        return;
      }

      if (this.kuzzleStore.currentId === this.environmentId && this.kuzzleStore.online) {
        await this.authStore.doLogout();
      }

      this.kuzzleStore.deleteEnvironment(this.environmentId);

      if (this.kuzzleStore.hasEnvironment) {
        this.$router.push({ name: 'SelectEnvironment' });
      } else {
        this.$router.push({ name: 'CreateEnvironment' });
      }

      this.close();
    },
  },
});
</script>
