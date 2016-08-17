<template>
  <div class="kuzzle-disconnected">
    <div class="container">
      <div class="row">
        <div class="col card wrapper s6 offset-s3">
          <div class="col s12">
            <h1 class="center-align logo">
              <img src="../../assets/logo.png" alt="Welcome to the Kuzzle Backoffice" style="width: 70%" />
            </h1>
          </div>
          <div class="col s12">
            <i class="fa fa-warning red-color"></i>
            <h1>Unable to connect to Kuzzle server at <span class="host primary">{{host}}</span> with port <span class="host primary">{{port}}</span>.</h1>
          </div>
          <div class="col s12">
            <h2>Waiting for connection to kuzzle. Once it will be connected you will be redirected to the homepage automatically.</h2>
          </div>

          <div class="col s1 offset-s5">
            <div class="preloader-wrapper active valign-wrapper">
              <div class="spinner-layer">
                <div class="circle-clipper left">
                  <div class="circle"></div>
                </div>
                <div class="gap-patch">
                  <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                  <div class="circle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .kuzzle-disconnected {
    position: fixed;
    top:0;
    left:0;
    bottom: 0;
    right: 0;
    padding-top: 50px;
    height: 100%;

    .logo {
      margin-top: 40px;
      margin-bottom: 50px;
    }

    .row {
      margin-bottom: 0;

      .card {
        padding-bottom: 20px;
      }

      i {
        font-size: 4em;
        margin-left: 10px;
        margin-top: 37px;
        margin-right: 20px;
        float: left;
      }
      h1 {
        font-size: 2em;
        margin-left: 15px;
        margin-bottom: 20px;

        .host {
          font-weight: bold;
        }
      }
      h2 {
        font-size: 1.5em;
        margin-bottom: 50px;
      }
    }
  }
</style>

<script>
  import kuzzle from '../../services/kuzzle'
  import { setConnection } from '../../vuex/modules/common/kuzzle/actions'

  let idConnect
  let idReconnect

  export default {
    name: 'KuzzleDisconnected',
    data () {
      return {
        host: null,
        port: null
      }
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
        this.setConnection(true)
        this.$router.go({name: 'Home'})
      })

      idConnect = kuzzle.addListener('connected', () => {
        this.setConnection(true)
        this.$router.go({name: 'Home'})
      })
    },
    destroyed () {
      kuzzle.removeListener('reconnected', idReconnect)
      kuzzle.removeListener('connected', idConnect)
    }
  }
</script>
