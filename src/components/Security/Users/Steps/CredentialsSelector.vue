<template>
  <div>
    <label></label>
    <m-select v-model="strategy" @input="selectStrategy">
      <option v-for="strategy in strategies">{{strategy}}</option>
    </m-select>

    <credentials
      :value="document"
      :mapping="mapping"
      @input="onCredentialsChanged"
    ></credentials>
  </div>
</template>

<script>
  import Headline from '../../../Materialize/Headline'
  import Credentials from '../../Common/JsonWithMapping'
  import kuzzle from '../../../../services/kuzzle'
  import MSelect from '../../../Common/MSelect'

  export default {
    name: 'Credentials',
    components: {
      Credentials,
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
        mapping: null,
        document: null,
        id: null,
        strategies: [],
        strategy: null
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
              this.mapping = fields
            })
        }
      }
    }
  }
</script>
