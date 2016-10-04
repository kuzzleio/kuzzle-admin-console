<template>
  <div>
    <div class="row">
      <div class="col offset-s4 s2">
        <env-switch @environment::create="editEnvironment" @environment::delete="deleteEnvironment"></env-switch>
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
        environmentId: null
      }
    },
    methods: {
      editEnvironment (id) {
        this.environmentId = id
        this.$broadcast('modal-open', 'create-env')
      },
      deleteEnvironment (id) {
        this.environmentId = id
        this.$broadcast('modal-open', 'delete-env')
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
