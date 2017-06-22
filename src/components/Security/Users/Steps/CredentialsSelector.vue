<template>
  <div>
    <label></label>
    <m-select v-model="strategy" @input="selectStrategy">
      <option v-for="strategy in strategies">{{strategy}}</option>
    </m-select>

    <!--<credentials-edit-->
      <!--id-mapping="credentialsMapping"-->
      <!--id-content="credentialsContent"-->
      <!--:mapping="mapping"-->
      <!--@input="onCredentialsChanged"-->
    <!--&gt;</credentials-edit>-->
    <div class="row">
      <div class="col s8">
        <div class="row" v-for="fieldName in fields">
          <div class="input-field col s12">
            <input v-model="credentials[fieldName]" type="text" :name="fieldName" :id="fieldName"/>
            <label :for="fieldName">{{ fieldName }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Headline from '../../../Materialize/Headline'
  import CredentialsEdit from '../../Common/JsonWithMapping'
  import kuzzle from '../../../../services/kuzzle'
  import MSelect from '../../../Common/MSelect'

  export default {
    name: 'CredentialsSelector',
    components: {
      CredentialsEdit,
      Headline,
      MSelect
    },
    mounted () {
      kuzzle.queryPromise({controller: 'auth', action: 'getStrategies'}, {})
        .then(res => {
          this.strategies = res.result
          this.strategy = this.strategies[0]
          this.selectStrategy(this.strategy)
        })
    },
    data () {
      return {
        error: '',
        fields: null,
        document: null,
        id: null,
        strategies: [],
        strategy: null,
        credentials: {}
      }
    },
    methods: {
      onCredentialsChanged (json) {
        this.$emit('input', {
          [this.strategy]: json
        })
      },
      selectStrategy (strategy) {
        this.strategy = strategy
        if (strategy) {
          kuzzle.security.getCredentialFieldsPromise(strategy)
            .then(fields => {
              this.fields = fields
              this.fields.forEach(fieldName => {
                this.$set(this.credentials, fieldName, null)
              })
            })
        }
      }
    }
  }
</script>
