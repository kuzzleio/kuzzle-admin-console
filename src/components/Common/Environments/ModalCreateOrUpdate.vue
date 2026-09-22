<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl" labelled-by="env-create-title">
      <DialogHeader>
        <DialogTitle id="env-create-title">
          {{ environmentId ? 'Update' : 'Create' }} Connection
        </DialogTitle>
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

import CreateEnvironment from './CreateEnvironment.vue';

export default defineComponent({
  name: 'EnvironmentsCreateModal',
  components: {
    Button,
    CreateEnvironment,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  },
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
  methods: {
    close(): void {
      this.$emit('update:open', false);
    },
    importEnv(): void {
      this.close();
      this.$emit('environment::importEnv');
    },
    submit(): void {
      const submitted = (
        this.$refs.createEnvironmentComponent as unknown as { submit: () => boolean }
      ).submit();

      this.$nextTick(() => {
        if (submitted) {
          this.close();
        }
      });
    },
  },
});
</script>
