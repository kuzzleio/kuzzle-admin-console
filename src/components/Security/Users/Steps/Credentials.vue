<template>
  <div>
    <headline>
      Credentials
    </headline>

    <label></label>
    <m-select v-model="strategy" @input="selectStrategy">
      <option v-for="strategy in strategies">{{strategy}}</option>
    </m-select>

    <create-or-update
            @credentials-create::create="next"
            @credentials-create::cancel="cancel"
            @credentials-create::reset-error="error = null"
            @credentials-create::error="setError"
            :error="error"
            v-model="document"
            @change-id="updateId"
            :mapping="mapping"
            :update="false">
    </create-or-update>
  </div>
</template>

<script>
  import Headline from '../../../Materialize/Headline'
  import CreateOrUpdate from '../../Common/CreateOrUpdatePluginAuthData'
  import kuzzle from '../../../../services/kuzzle'
  import MSelect from '../../../Common/MSelect'

  export default {
    name: 'Credentials',
    components: {
      CreateOrUpdate,
      Headline,
      MSelect
    },
    props: {
      editionStep: {type: Number, default: 0}
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
      next (credentials) {
        const finalCredentials = {}

        finalCredentials[this.strategy] = credentials
        this.$emit('submit', finalCredentials)
//        this.error = ''
//
//        if (!credentials) {
//          this.error = 'The credentials are invalid, please review it'
//          return
//        }
//
//        kuzzle.security.createCredentialsPromise(this.strategy, this.id, credentials)
//          .then(() => this.$router.push({name: 'SecurityUsersList'}))
//          .catch(err => {
//            this.error = `An error occured while creating user: <br />${err.message}`
//          })
      },
      selectStrategy (strategy) {
        this.strategy = strategy
        if (strategy) {
          kuzzle.security.getCredentialFieldsPromise(strategy)
            .then(fields => {
              this.mapping = fields
            })
        }
      },
      cancel () {

      },
      setError () {

      },
      updateId (id) {
        this.id = id
      }
    },
    watch: {
      editionStep () {
        this.$emit('step-change', this.document)
      }
    }
  }
</script>
