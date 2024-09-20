<template>
  <b-modal
    class="CreateIndexModal"
    ref="createIndexModal"
    size="lg"
    title="Index creation"
    body-class="p-0"
    :id="modalId"
    @hide="resetForm"
  >
    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="onCancel" :disabled="modalBusy">
        Cancel
      </b-button>
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
      <b-form v-on:submit.prevent="tryCreateIndex">
        <b-form-group
          data-cy="CreateIndexModal-name"
          label="Index name"
          label-for="indexName"
        >
          <template v-slot:description
            >The index name should contain only lowercase characters and no
            spaces. It also must not contain de following characters:
            <code>\</code>, <code>/</code>, <code>*</code>, <code>?</code>,
            <code>"</code>, <code>&lt;</code>, <code>></code>, <code>|</code>,
            <code>,</code>, <code>#</code>, <code>:</code>, <code>%</code>,
            <code>&</code>, <code>.</code>
          </template>
          <template v-slot:invalid-feedback id="profile-id-feedback">
            <span v-if="!v$.index.required">This field cannot be empty</span>
            <span v-else-if="!v$.index.isNotWhitespace"
              >This field cannot contain just whitespaces</span
            >
            <span v-else-if="!v$.index.startsWithLetter"
              >This field cannot start with a whitespace</span
            >
            <span v-else-if="!v$.index.isLowercase"
              >This field cannot contain uppercase letters</span
            >
            <span v-else-if="!v$.index.validChars"
              >This field cannnot contain invalid chars</span
            >
          </template>
          <b-form-input
            id="indexName"
            autofocus
            required
            type="text"
            v-model="v$.index.$model"
            :state="validateState('index')"
          ></b-form-input>
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

<style lang="scss"></style>

<script>
import { useVuelidate } from '@vuelidate/core'
import { not, required } from '@vuelidate/validators'

import { startsWithSpace, isWhitespace, isUppercase } from '@/validators'

function includesInvalidIndexChars(value) {
  // eslint-disable-next-line no-useless-escape
  return /[@\\\/\*\?"<>,#:%&\|\.]/.test(value)
}

export default {
  name: 'CreateIndexModal',
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  setup() { return { v$: useVuelidate() } },
  data() {
    return {
      error: '',
      index: '',
      modalBusy: false
    }
  },
  validations() {
    return {
      index: {
        isNotWhitespace: not(isWhitespace),
        startsWithLetter: not(startsWithSpace),
        isLowercase: not(isUppercase),
        required,
        validChars: not(includesInvalidIndexChars)
      }
    }
  },
  methods: {
    validateState(fieldName) {
      const { $dirty, $error } = this.v$[fieldName]
      return $dirty ? !$error : null
    },
    resetForm() {
      this.v$.$reset()
      this.index = ''
      this.error = ''
      this.modalBusy = false
    },
    async onCreateSuccess() {
      this.resetForm()
      this.$bvModal.hide(this.modalId)
      this.$emit('create-successful')
    },
    async onCancel() {
      this.resetForm()
      this.$bvModal.hide(this.modalId)
    },
    async tryCreateIndex() {
      this.modalBusy = true
      this.v$.$touch()
      if (this.v$.$anyError) {
        return
      }

      try {
        await this.$store.direct.dispatch.index.createIndex(this.index)
        this.onCreateSuccess()
      } catch (err) {
        this.error = err.message
        this.modalBusy = false
      }
    }
  }
}
</script>
