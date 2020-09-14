<template>
  <b-modal
    class="CreateIndexModal"
    ref="createIndexModal"
    size="lg"
    title="Index creation"
    :id="id"
    @hide="resetForm"
    @close="hideModal"
  >
    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="hideModal">
        Cancel
      </b-button>
      <b-button
        data-cy="CreateIndexModal-createBtn"
        variant="primary"
        @click="tryCreateIndex"
      >
        OK
      </b-button>
    </template>
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
          <span v-if="!$v.index.required">This field cannot be empty</span>
          <span v-else-if="!$v.index.isNotWhitespace"
            >This field cannot contain just whitespaces</span
          >
          <span v-else-if="!$v.index.startsWithLetter"
            >This field cannot start with a whitespace</span
          >
          <span v-else-if="!$v.index.isLowercase"
            >This field cannot contain uppercase letters</span
          >
          <span v-else-if="!$v.index.validChars"
            >This field cannnot contain invalid chars</span
          >
        </template>
        <b-form-input
          id="indexName"
          autofocus
          required
          type="text"
          v-model="$v.index.$model"
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
  </b-modal>
</template>

<style lang="scss"></style>

<script>
import { validationMixin } from 'vuelidate'
import { not, required } from 'vuelidate/lib/validators'
import { startsWithSpace, isWhitespace, isUppercase } from '../../../validators'

function includesInvalidIndexChars(value) {
  // eslint-disable-next-line no-useless-escape
  return /[@\\\/\*\?"<>,#:%&\|\.]/.test(value)
}
export default {
  mixins: [validationMixin],
  name: 'CreateIndexModal',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      error: '',
      index: ''
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
      const { $dirty, $error } = this.$v[fieldName]
      return $dirty ? !$error : null
    },
    resetForm() {
      this.index = ''
      this.error = ''
    },
    async hideModal() {
      this.resetForm()
      this.$bvModal.hide(this.id)
      this.$emit('modal-close')
    },
    async tryCreateIndex() {
      this.$v.$touch()
      if (this.$v.$anyError) {
        return
      }

      try {
        await this.$store.direct.dispatch.index.createIndex(this.index)
        this.hideModal()
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
