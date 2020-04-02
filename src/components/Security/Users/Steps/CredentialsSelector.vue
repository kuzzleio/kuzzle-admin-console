<template>
  <b-row class="Credentials">
    <b-col cols="2">
      <strong>Credentials</strong>
    </b-col>
    <b-col>
      <b-card no-body class="Credentials-selector">
        <b-tabs card vertical>
          <template v-slot:tabs-start>
            <span class="text-secondary text-small mb-2 px-3"
              >Auth strategies</span
            >
          </template>

          <!-- Render this if no tabs -->
          <template v-slot:empty>
            <div class="text-center text-muted">
              No strategies found<br />
              It looks like no authentication strategies are installed on your
              Kuzzle instance.
            </div>
          </template>
          <b-tab
            v-for="(strategy, index) in strategies"
            :key="index"
            :title="strategy"
          >
            <div
              v-for="fieldName in credentialsMapping[strategy]"
              :key="`update-user-credential-${fieldName}`"
            >
              <b-form-group
                label-cols="2"
                :label="getFieldHelp(fieldName)"
                :label-for="fieldName"
              >
                <b-form-input
                  :id="fieldName"
                  :value="credentials[strategy][fieldName]"
                  :type="fieldType(fieldName)"
                  :name="fieldName"
                  @input="onFieldChange"
                />
              </b-form-group>
            </div>
          </b-tab>
        </b-tabs>
      </b-card>
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

<style lang="scss">
.Credentials-selector {
  .card-header {
    border-right: 1px solid #dee2e6;
  }
  .nav-tabs .nav-link.active {
    border-color: #dee2e6 #fff #dee2e6 #dee2e6;
    border-style: solid;
    border-width: 1px;
    border-radius: 0.25rem 0 0 0.25rem;
    margin-right: -1.33rem;
  }
}
</style>
