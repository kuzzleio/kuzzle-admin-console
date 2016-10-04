<template>
  <div>
    <div class="row">
      <div class="col s12">
         <ul>
          <env-switch></env-switch>
        </ul>
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
    <div class="row kuzzle-disconnected" v-if="disconnected">
      <div class="col s12">
        <h4><i class="fa fa-question-circle-o"></i> Are you sure the Kuzzle Server is up? This doesn't look very good...</h4>
      </div>
    </div>

    <modal-create :environment-id="environmentId"></modal-create>
    <modal-delete :environment-id="environmentId"></modal-delete>
  </div>
</template>

<script>
  import kuzzle from '../../services/kuzzle'
  import Connecting from './Connecting'
  import EnvSwitch from '../Common/Environments/Switch'
  import ModalCreate from '../Common/Environments/ModalCreate'
  import ModalDelete from '../Common/Environments/ModalDelete'

  let idConnect
  let idReconnect

  export default {
    name: 'KuzzleDisconnectedPage',
    data () {
      return {
        host: null,
        port: null,
        disconnected: false
      }
    },
    components: {
      Connecting,
      EnvSwitch,
      ModalCreate,
      ModalDelete
    },
    ready () {
      this.host = kuzzle.host
      this.port = kuzzle.wsPort

      idReconnect = kuzzle.addListener('reconnected', () => {
        this.$router.go({name: 'Home'})
      })

      idConnect = kuzzle.addListener('connected', () => {
        this.$router.go({name: 'Home'})
      })

      setTimeout(() => {
        this.disconnected = true
      }, 7000)
    },
    destroyed () {
      kuzzle.removeListener('reconnected', idReconnect)
      kuzzle.removeListener('connected', idConnect)
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
      font-family: "Roboto", "Arial", sans-serif;
      font-size: 1.3em;
      font-weight: 300;

      .host {
        font-weight: bold;
      }
      margin-bottom: 0;
    }
  }
</style>
