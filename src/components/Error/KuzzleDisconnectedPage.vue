<template>
  <div>
    <div class="row">
      <div class="col offset-s4 s2">
        <environment-switch @environment::create="editEnvironment" />
      </div>
    </div>
    <div class="col s12">
      <h4><i class="fa fa-plug" /> Connecting to Kuzzle...</h4>
    </div>
    <div class="row">
      <div class="col s12">
        <connecting :host="host" :port="port" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import EnvironmentSwitch from '@/components/Common/Environments/EnvironmentsSwitch.vue'
import Connecting from './Connecting.vue'

let idConnect
let idReconnect

export default {
  name: 'KuzzleDisconnectedPage',
  components: {
    Connecting,
    EnvironmentSwitch
  },
  data() {
    return {
      host: null,
      port: null
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle'])
  },
  mounted() {
    this.host = this.$kuzzle.protocol.host
    this.port = this.$kuzzle.protocol.port

    idReconnect = this.$kuzzle.on('reconnected', () => {
      this.$router.push({ name: 'Home' })
    })

    idConnect = this.$kuzzle.on('connected', () => {
      this.$router.push({ name: 'Home' })
    })

    if (
      this.$kuzzle.protocol.state === 'connected' ||
      this.$kuzzle.protocol.state === 'reconnected'
    ) {
      this.$router.push({ name: 'Login' })
    }
  },
  destroyed() {
    this.$kuzzle.removeListener('reconnected', idReconnect)
    this.$kuzzle.removeListener('connected', idConnect)
  },
  methods: {
    editEnvironment(id) {
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
