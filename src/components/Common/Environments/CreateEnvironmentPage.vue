<template>
  <form class="CreateEnvironmentPage" @submit.prevent="createEnvironment">
    <b-container>
      <b-card>
        <b-jumbotron
          lead="Please provide the details below to connect to your Kuzzle instance."
        >
          <template v-slot:header
            ><img
              src="../../../assets/logo.svg"
              alt="Welcome to the Kuzzle Admin Console"
              height="60"
            />
            <h1>Create a Connection</h1>
          </template>
        </b-jumbotron>

        <create-environment
          ref="createEnvironmentComponent"
          :environment-id="null"
          @environment::importEnv="importEnv"
        />

        <template v-slot:footer>
          <div class="text-right">
            <b-button variant="primary" type="submit">
              Create connection
            </b-button>
          </div>
        </template>
      </b-card>
    </b-container>
  </form>
</template>

<script>
import CreateEnvironment from './CreateEnvironment'

export default {
  name: 'CreateEnvironmentPage',
  components: {
    CreateEnvironment
  },
  methods: {
    createEnvironment() {
      this.$refs.createEnvironmentComponent
        .createEnvironment()
        .then(() => this.$router.push({ name: 'Home' }))
    },
    importEnv() {
      this.$emit('environment::importEnv')
    }
  }
}
</script>

<style lang="sass">
.CreateEnvironmentPage
  height: 100vh
  display: flex
  flex-direction: column
  justify-content: center
</style>
