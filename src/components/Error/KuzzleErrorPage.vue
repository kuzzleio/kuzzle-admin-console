<template>
  <div class="KuzzleErrorPage">
    <b-jumbotron>
      <template v-slot:header>
        <img
          alt="Welcome to the Kuzzle Admin Console"
          class="mb-3"
          height="60"
          src="../../assets/logo.svg"
        />
        <h2>{{ $store.state.kuzzle.errorFromKuzzle }}</h2>
      </template>

      <hr class="my-4" />

      <b-row align-v="center">
        <b-col sm="1">
          <b-spinner variant="secondary" label="Spinning"> </b-spinner
        ></b-col>
        <b-col sm="7" class="align-middle"
          >Trying to connect to Kuzzle...</b-col
        >
        <b-col sm="2" class="text-right">
          <span class="text-muted align-middle">Connecting to</span>
        </b-col>
        <b-col sm="2" class="text-right">
          <environment-switch
            @environment::create="editEnvironment"
            @environment::delete="deleteEnvironment"
            @environment::importEnv="importEnv"
          />
        </b-col>
      </b-row>
    </b-jumbotron>
  </div>
</template>

<script>
import EnvironmentSwitch from '../Common/Environments/EnvironmentsSwitch'

export default {
  name: 'KuzzleErrorPage',
  components: {
    EnvironmentSwitch
  },
  data() {
    return {
      host: null,
      port: null
    }
  },
  computed: {
    errorInternalMessage() {
      return this.$store.state.kuzzle.errorFromKuzzle
    }
  },
  methods: {
    editEnvironment(id) {
      this.$emit('environment::create', id)
    },
    deleteEnvironment(id) {
      this.$emit('environment::delete', id)
    },
    importEnv() {
      this.$emit('environment::importEnv')
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
    font-family: 'Roboto', 'Arial', sans-serif;
    font-size: 1.3em;
    font-weight: 300;

    .host {
      font-weight: bold;
    }
    margin-bottom: 0;
  }
}
</style>
