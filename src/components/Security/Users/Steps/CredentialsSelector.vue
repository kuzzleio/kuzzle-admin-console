<template>
  <div>
    <h5>Available strategies</h5>
    <hr />
    <m-select v-model="currentStrategy">
      <option v-for="(strategy, index) in strategies" :key="index">
        {{ strategy }}
      </option>
    </m-select>

    <div class="row">
      <div class="col s8">
        <div
          v-for="(fieldName, index) in fieldsForStrategy"
          :key="index"
          class="row"
        >
          <div class="input-field col s12">
            <input
              :id="fieldName"
              :value="credentialsForStrategy[fieldName]"
              :type="fieldType(fieldName)"
              :name="fieldName"
              @input="onFieldChange"
            />
            <label
              :for="fieldName"
              :class="{ active: credentialsForStrategy[fieldName] }"
              >{{ fieldName }}</label
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MSelect from '../../../Common/MSelect'

export default {
  name: 'CredentialsSelector',
  components: {
    MSelect
  },
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
          [input.target.name]: input.target.value
        }
      })
    }
  }
}
</script>
