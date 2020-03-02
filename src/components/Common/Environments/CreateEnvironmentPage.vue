<template>
  <div class="CreateEnvironmentPage">
    <form
      class="CreateEnvironmentPage-form"
      @submit.prevent="createEnvironment"
    >
      <b-container>
        <b-card class="my-3">
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
              <b-button
                class="CreateEnvironment-import mr-3"
                data-cy="CreateEnvironment-import"
                variant="outline-primary"
                @click="importEnv"
              >
                Import a connection
              </b-button>
              <b-button
                data-cy="Environment-SubmitButton"
                variant="primary"
                type="submit"
              >
                Create connection
              </b-button>
            </div>
          </template>
        </b-card>
      </b-container>
    </form>
  </div>
</template>

<script>
import CreateEnvironment from './CreateEnvironment'

export default {
  name: 'CreateEnvironmentPage',
  components: {
    CreateEnvironment
  },
  methods: {
    async createEnvironment() {
      const newEnvId = await this.$refs.createEnvironmentComponent.createEnvironment()

      if (newEnvId) {
        this.$store.direct.dispatch.kuzzle.switchEnvironment(newEnvId)
        this.$router.push('/')
      }
    },
    importEnv() {
      this.$emit('environment::importEnv')
    }
  }
}
</script>

<style lang="scss">
.CreateEnvironmentPage {
  height: 100vh;
  overflow: auto;
}
.CreateEnvironmentPage-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
