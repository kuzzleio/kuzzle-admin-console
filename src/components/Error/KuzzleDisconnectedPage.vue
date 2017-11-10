<template>
  <div>
    <div class="row">
      <div class="col offset-s4 s2">
        <environment-switch @environment::create="editEnvironment"></environment-switch>
      </div>
    </div>
    <div class="col s12">
      <h4><i class="fa fa-plug"></i> Connecting to Kuzzle...</h4>
    </div>
    <div class="row">
      <div class="col s12">
        <connecting :host="host" :port="port"></connecting>
      </div>
    </div>

  </div>
</template>

<script>
  import {kuzzle} from '../../services/kuzzleWrapper'
  import Connecting from './Connecting'
  import EnvironmentSwitch from '../Common/Environments/EnvironmentsSwitch'

  let idConnect
  let idReconnect

  export default {
    name: 'KuzzleDisconnectedPage',
    data () {
      return {
        host: null,
        port: null
      }
    },
    components: {
      Connecting,
      EnvironmentSwitch
    },
    mounted () {
      this.host = kuzzle.network.host
      this.port = kuzzle.network.port

      idReconnect = kuzzle.addListener('reconnected', () => {
        this.$router.push({name: 'Home'})
      })

      idConnect = kuzzle.addListener('connected', () => {
        this.$router.push({name: 'Home'})
      })

      if (kuzzle.network.state === 'connected' || kuzzle.network.state === 'reconnected') {
        this.$router.push({name: 'Login'})
      }
    },
    destroyed () {
      kuzzle.removeListener('reconnected', idReconnect)
      kuzzle.removeListener('connected', idConnect)
    },
    methods: {
      editEnvironment (id) {
        this.$emit('environment::create', id)
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .kuzzle-disconnected {
    margin-top: 30px;

    .card {
      padding-bottom: 20px;
    }

    p {
      font-size: 1.3em;
      font-weight: 300;

      .host {
        font-weight: bold;
      }
      margin-bottom: 0;
    }
  }
</style>
