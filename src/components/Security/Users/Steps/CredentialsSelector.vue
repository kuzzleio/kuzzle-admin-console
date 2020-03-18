<template>
  <b-row>
    <b-col cols="6">
      <b-row
        v-for="fieldName in fieldsForStrategy"
        :key="`update-user-credential-${fieldName}`"
      >
        <b-col cols="12">
          <b-form-text>
            {{ getFieldHelp(fieldName) }}
          </b-form-text>
          <b-form-input
            :value="credentialsForStrategy[fieldName]"
            :type="fieldType(fieldName)"
            :name="fieldName"
            @input="onFieldChange"
          >
          </b-form-input>
        </b-col>
      </b-row>
    </b-col>
    <b-col cols="6">
      <b-form-text>
        Available strategies
      </b-form-text>
      <b-form-select v-model="currentStrategy">
        <b-select-option
          v-for="(strategy, index) in strategies"
          :key="index"
          :value="strategy"
        >
          {{ strategy }}
        </b-select-option>
      </b-form-select>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'CredentialsSelector',
  components: {},
  props: ['fields', 'strategies', 'credentials', 'credentialsMapping'],
  data() {
    return {
      error: '',
      document: null,
      id: null,
      currentStrategy: null
    }
  },
  computed: {
    fieldsForStrategy() {
      if (
        !this.credentialsMapping ||
        !this.credentialsMapping[this.currentStrategy]
      ) {
        return []
      }

      return this.credentialsMapping[this.currentStrategy]
    },
    credentialsForStrategy() {
      if (!this.credentials || !this.credentials[this.currentStrategy]) {
        return []
      }

      return this.credentials[this.currentStrategy]
    }
  },
  watch: {
    strategies() {
      if (!this.strategies.length) {
        return
      }
      this.currentStrategy = this.strategies[0]
    }
  },
  methods: {
    getFieldHelp(fieldName) {
      return fieldName.replace(/^\w/, c => c.toUpperCase())
    },
    fieldType(fieldName) {
      if (fieldName === 'password') {
        return 'password'
      }

      return 'text'
    },
    onFieldChange(input) {
      this.$emit('input', {
        strategy: this.currentStrategy,
        credentials: {
          ...this.credentials[this.currentStrategy],
          input
        }
      })
    }
  }
}
</script>
