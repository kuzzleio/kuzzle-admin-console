<template>
  <b-modal
    :id="modalId"
    ref="createIndexModal"
    class="CreateIndexModal"
    size="lg"
    title="Index creation"
    body-class="p-0"
    @hide="resetForm"
  >
    <template #modal-footer>
      <b-button variant="secondary" :disabled="modalBusy" @click="onCancel"> Cancel </b-button>
      <b-button
        data-cy="CreateIndexModal-createBtn"
        variant="primary"
        :disabled="modalBusy"
        @click="tryCreateIndex"
      >
        OK
      </b-button>
    </template>
    <b-overlay :show="modalBusy" rounded="sm" class="p-3">
      <b-form @submit.prevent="tryCreateIndex">
        <b-form-group
          data-cy="CreateIndexModal-name"
          label="Index name"
          label-for="indexName"
          :invalid-feedback="indexFeedback"
        >
          <template #description
            >The index name should contain only lowercase characters and no spaces. It also must not
            contain de following characters: <code>\</code>, <code>/</code>, <code>*</code>,
            <code>?</code>, <code>"</code>, <code>&lt;</code>, <code>></code>, <code>|</code>,
            <code>,</code>, <code>#</code>, <code>:</code>, <code>%</code>, <code>&</code>,
            <code>.</code>
          </template>
          <b-form-input
            id="indexName"
            v-model="v$.index.$model"
            autofocus
            required
            type="text"
            :state="validateState('index')"
          />
        </b-form-group>
        <b-alert
          data-cy="CreateIndexModal-alert"
          style="overflow: auto"
          :show="error.length"
          variant="danger"
          >{{ error }}</b-alert
        >
      </b-form>
    </b-overlay>
  </b-modal>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { not, required, helpers } from '@vuelidate/validators';

import { KIndexActionsTypes, StoreNamespaceTypes } from '@/store';
import { startsWithSpace, isWhitespace, isUppercase } from '@/validators';

function includesInvalidIndexChars(value) {
  // eslint-disable-next-line no-useless-escape
  return /[@\\\/\*\?"<>,#:%&\|\.]/.test(value);
}

export default {
  name: 'CreateIndexModal',
  props: {
    modalId: {
      type: String,
      required: true,
    },
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      error: '',
      index: '',
      modalBusy: false,
    };
  },
  validations() {
    return {
      index: {
        isNotWhitespace: helpers.withMessage(
          'This field cannot contain just whitespaces',
          not(isWhitespace),
        ),
        startsWithLetter: helpers.withMessage(
          'This field cannot start with a whitespace',
          not(startsWithSpace),
        ),
        isLowercase: helpers.withMessage(
          'This field cannot contain uppercase letters',
          not(isUppercase),
        ),
        required: helpers.withMessage('This field cannot be empty', required),
        validChars: helpers.withMessage(
          'This field cannnot contain invalid chars',
          not(includesInvalidIndexChars),
        ),
      },
    };
  },
  computed: {
    indexFeedback() {
      if (this.v$.index.$errors.length > 0) {
        return this.v$.index.$errors[0].$message;
      }

      return null;
    },
  },
  methods: {
    validateState(fieldName) {
      const { $dirty, $error } = this.v$[fieldName];
      return $dirty ? !$error : null;
    },
    resetForm() {
      this.v$.$reset();
      this.index = '';
      this.error = '';
      this.modalBusy = false;
    },
    async onCreateSuccess() {
      this.resetForm();
      this.$bvModal.hide(this.modalId);
      this.$emit('create-successful');
    },
    async onCancel() {
      this.resetForm();
      this.$bvModal.hide(this.modalId);
    },
    async tryCreateIndex() {
      this.v$.$touch();
      if (this.v$.$errors.length > 0) {
        return;
      }

      this.modalBusy = true;

      try {
        await this.$store.dispatch(
          `${StoreNamespaceTypes.INDEX}/${KIndexActionsTypes.CREATE_INDEX}`,
          this.index,
        );
        this.onCreateSuccess();
      } catch (err) {
        this.error = err.message;
        this.modalBusy = false;
      }
    },
  },
};
</script>

<style lang="scss"></style>
