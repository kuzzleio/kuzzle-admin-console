<template>
  <div>
    <div class="row">
      <div class="col offset-s4 s2">
        <environment-switch
          @environment::create="editEnvironment"
          @environment::delete="deleteEnvironment">
        </environment-switch>
      </div>
    </div>
    <div class="row message-warning">
      <h5>{{$store.state.kuzzle.errorFromKuzzle.message}}</h5>
      <div class="divider"></div>
      <div class="message" v-if="errorStatus">
        <i class="fa fa-plug"></i>
        [{{ errorStatus }}]
      </div>
    </div>
    <div class="row kuzzle-disconnected">
      <div class="col s12">
        <p>I'm doing my best to reconnect to Kuzzle ...</p>
      </div>

      <div class="col s1 offset-s5">
        <p>
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
        </p>
      </div>
    </div>

  </div>
</template>

<script>
  import Connecting from './Connecting'
  import EnvironmentSwitch from '../Common/Environments/EnvironmentsSwitch'

  export default {
    name: 'KuzzleErrorPage',
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
    computed: {
      errorStatus () {
        if (!this.$store.state.kuzzle.errorFromKuzzle ||
            !this.$store.state.kuzzle.errorFromKuzzle.internal) {
          return null
        }
        return this.$store.state.kuzzle.errorFromKuzzle.internal.status
      }
    },
    methods: {
      editEnvironment (id) {
        this.$emit('environment::create', id)
      },
      deleteEnvironment (id) {
        this.$emit('environment::delete', id)
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .message-warning {
    h5 {
      font-size: 1.2rem;
    }
  }
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
