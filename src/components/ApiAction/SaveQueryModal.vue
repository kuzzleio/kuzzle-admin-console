<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent labelled-by="save-query-title">
      <DialogHeader>
        <DialogTitle id="save-query-title">Choose a name for this query</DialogTitle>
      </DialogHeader>

      <form ref="form" class="tw:flex tw:flex-col tw:gap-1.5" @submit.stop.prevent="handleOk">
        <Label for="name-input">Name</Label>
        <Input
          id="name-input"
          v-model="name"
          :aria-describedby="nameState === false ? 'name-feedback' : undefined"
          :aria-invalid="nameState === false ? 'true' : undefined"
          :class="nameState === false ? 'tw:border-destructive' : ''"
          data-cy="api-actions-modal-name-input"
          required
        />
        <p
          v-if="nameState === false"
          id="name-feedback"
          class="tw:m-0 tw:text-sm tw:text-destructive"
        >
          {{ feedback }}
        </p>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="close"> Cancel </Button>
        <Button @click="handleOk">
          <span data-cy="api-actions-modal-ok-button">OK</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default defineComponent({
  name: 'SaveQueryModal',
  components: {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
  },
  props: {
    isQueryNameValid: {
      default: null,
      type: Function as PropType<((name: string) => boolean) | null>,
    },
    open: {
      default: false,
      type: Boolean,
    },
  },
  data(): { feedback: string; name: string; nameState: boolean | null } {
    return {
      feedback: '',
      name: '',
      nameState: null,
    };
  },
  watch: {
    open(open: boolean) {
      if (!open) {
        this.reset();
      }
    },
  },
  methods: {
    checkFormValidity(): boolean {
      const isPresent = (this.$refs.form as HTMLFormElement).checkValidity();
      const isValid = this.isQueryNameValid ? this.isQueryNameValid(this.name) : true;

      this.nameState = isPresent && isValid;

      if (!this.nameState) {
        this.feedback = isPresent ? 'Name already used' : 'Name is required';
      }

      return this.nameState;
    },
    close(): void {
      this.$emit('update:open', false);
    },
    handleOk(): void {
      if (!this.checkFormValidity()) {
        return;
      }

      this.$emit('storeNewQuery', this.name);
      this.close();
    },
    reset(): void {
      this.feedback = '';
      this.name = '';
      this.nameState = null;
    },
  },
});
</script>
