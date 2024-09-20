<template>
  <b-modal :id="modalId" class="DeleteIndexModal" size="lg" @hide="resetForm">
    <template #modal-title>
      Index
      <strong>{{ truncateName(index ? index.name : '') }}</strong> deletion
    </template>

    <template #modal-footer>
      <b-button variant="secondary" @click="onCancel()"> Cancel </b-button>
      <b-button
        variant="danger"
        data-cy="DeleteIndexModal-deleteBtn"
        :disabled="!isConfirmationValid"
        @click="performDelete()"
      >
        OK
      </b-button>
    </template>
    <form ref="form" @submit.prevent="performDelete()">
      <b-form-group
        label="Type the name of the index to confirm deletion"
        label-for="inputConfirmation"
        description="This operation is NOT reversible"
      >
        <b-form-input
          id="inputConfirmation"
          v-model="confirmation"
          autofocus
          data-cy="DeleteIndexModal-name"
          type="text"
          required
        />
      </b-form-group>
      <b-alert :show="error.length" variant="danger">{{ error }}</b-alert>
    </form>
  </b-modal>
</template>

<script>
import { truncateName } from '@/utils';

export default {
  name: 'DeleteIndexModal',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    index: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      error: '',
      confirmation: '',
    };
  },
  computed: {
    isConfirmationValid() {
      return this.index && this.confirmation === this.index.name;
    },
  },
  methods: {
    truncateName,
    resetForm() {
      this.confirmation = '';
      this.error = '';
    },
    setError(error) {
      this.error = error;
    },
    onCancel() {
      this.resetForm();
      this.$emit('cancel');
    },

    async performDelete() {
      if (!this.isConfirmationValid) {
        return;
      }
      this.$emit('confirm-deletion');
    },
  },
};
</script>
