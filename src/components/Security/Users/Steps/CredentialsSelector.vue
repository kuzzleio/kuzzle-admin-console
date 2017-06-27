<template>
  <div>
    <label></label>
    <m-select v-model="currentStrategy">
      <option v-for="strategy in strategies">{{strategy}}</option>
    </m-select>

    <div class="row">
      <div class="col s8">
        <div class="row" v-for="fieldName in fieldsForStrategy">
          <div class="input-field col s12">
            <input @input="onFieldChange" :value="credentialsForStrategy[fieldName]" :type="fieldType(fieldName)" :name="fieldName" :id="fieldName"/>
            <label :for="fieldName" :class="{'active': credentialsForStrategy[fieldName]}">{{ fieldName }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Headline from '../../../Materialize/Headline'
  import CredentialsEdit from '../../Common/JsonWithMapping'
  import MSelect from '../../../Common/MSelect'

  export default {
    name: 'CredentialsSelector',
    components: {
      CredentialsEdit,
      Headline,
      MSelect
    },
    props: ['fields', 'strategies', 'credentials', 'credentialsMapping'],
    data () {
      return {
        error: '',
        document: null,
        id: null,
        currentStrategy: null
      }
    },
    computed: {
      fieldsForStrategy () {
        if (!this.credentialsMapping || !this.credentialsMapping[this.currentStrategy]) {
          return []
        }

        return this.credentialsMapping[this.currentStrategy]
      },
      credentialsForStrategy () {
        if (!this.credentials || !this.credentials[this.currentStrategy]) {
          return []
        }

        return this.credentials[this.currentStrategy]
      }
    },
    methods: {
      fieldType (fieldName) {
        if (fieldName === 'password') {
          return 'password'
        }

        return 'text'
      },
      onFieldChange (input) {
        this.$emit('input', {
          strategy: this.currentStrategy,
          credentials: {
            ...this.credentials[this.currentStrategy],
            [input.target.name]: input.target.value
          }
        })
      }
    },
    watch: {
      strategies () {
        if (!this.strategies.length) {
          return
        }
        this.currentStrategy = this.strategies[0]
      }
    }
  }
</script>
