<template>
  <form class="login" @submit.prevent="createEnvironment">
    <div class="container">
      <div class="row">
        <div class="col card wrapper s10 offset-s1 m8 offset-m2 l6 offset-l3">
          <div class="row">
            <div class="col s12">
              <h2 class="center-align logo">
                <img src="../../../assets/logo.svg" alt="Welcome to the Kuzzle Backoffice" style="width: 70%" />
              </h2>
            </div>
          </div>

          <div class="row message-warning">
            <h5>Environment creation</h5>
            <div class="divider"></div>
            <p class="message">
              In order to access to your Kuzzle instance, you must provide several information about where it is hosted.
            </p>
          </div>

          <create-environment
            :environment-id="null"
            ref="createEnvironmentComponent"
            >
          </create-environment>

          <div class="row">
            <div class="col s2 right">
              <button type="submit" class="waves-effect btn">Create</button>
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
      createEnvironment () {
        try {
          this.$refs.createEnvironmentComponent.createEnvironment()
            .then(() => this.$router.push({name: 'Home'}))
        } catch (e) {
        }
      }
    }
  }
</script>
