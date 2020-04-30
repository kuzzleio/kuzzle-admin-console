<template>
  <form class="CreateEnvironmentPage login" @submit.prevent="createEnvironment">
    <div class="container">
      <div class="row">
        <div class="col card wrapper s10 offset-s1 m8 offset-m2 l6 offset-l3">
          <h2 class="center-align logo">
            <img
              src="/src/assets/logo.svg"
              alt="Welcome to the Kuzzle Admin Console"
              style="width: 70%"
            />
          </h2>
          <div class="row message-warning">
            <h5>Create a Connection</h5>
            <div class="divider" />
            <p class="message">
              Please provide the details below to connect to your Kuzzle
              instance.
            </p>
          </div>

          <create-environment
            ref="createEnvironmentComponent"
            :environment-id="null"
            @environment::importEnv="importEnv"
          />

          <div class="row">
            <div class="col s4 right">
              <button
                type="submit"
                class="CreateEnvironmentPage-createBtn Environment-SubmitButton waves-effect btn"
              >
                Create connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
