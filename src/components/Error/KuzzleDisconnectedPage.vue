<template>
  <div>
    <div class="col s12">
      <h4><i class="fa fa-warning red-color"></i> Can't connect to Kuzzle</h4>
    </div>
    <div class="row">
      <div class="col s12">
        <kuzzle-disconnected :host="host" :port="port"></kuzzle-disconnected>
      </div>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>

</style>

<script>
  import kuzzle from '../../services/kuzzle'
  import KuzzleDisconnected from './KuzzleDisconnected'
  import { setConnection } from '../../vuex/modules/common/kuzzle/actions'

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
      KuzzleDisconnected
    },
    vuex: {
      actions: {
        setConnection
      }
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
