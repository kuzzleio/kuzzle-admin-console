<template>
  <div class="SelectEnvironmentPage">
    <b-container class="SelectEnvironmentPage-container h-100">
      <b-card class="my-3">
        <b-jumbotron lead="Please select a Kuzzle instance to connect to.">
          <template v-slot:header
            ><img
              src="../../../assets/logo.svg"
              alt="Welcome to the Kuzzle Admin Console"
              height="60"
            />
            <h1>Select Kuzzle</h1>
          </template>
          <hr class="my-4" />

          <b-row align-v="center">
            <b-col sm="8" class="text-right">
              <span class="text-muted align-middle">Connect to</span>
            </b-col>
            <b-col sm="4" class="text-right">
              <environment-selector
                @environment::create="$emit('environment::create', $event)"
                @environment::delete="$emit('environment::delete', $event)"
                @environment::importEnv="$emit('environment::importEnv')"
                @environmentSwitched="onEnvSwitched"
              />
            </b-col>
          </b-row>
        </b-jumbotron>
      </b-card>
    </b-container>
  </div>
</template>

<script>
import EnvironmentSelector from './EnvironmentsSwitch.vue'

export default {
  name: 'SelectEnvironmentPage',
  components: { EnvironmentSelector },
  methods: {
    onEnvSwitched() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style>
.SelectEnvironmentPage {
  height: 100vh;
  overflow: auto;
}
.SelectEnvironmentPage-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
