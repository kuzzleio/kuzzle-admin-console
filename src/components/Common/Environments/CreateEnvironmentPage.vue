<template>
  <div class="CreateEnvironmentPage">
    <form class="CreateEnvironmentPage-form" @submit.prevent="submit">
      <b-container>
        <b-card>
          <b-jumbotron lead="Please provide the details below to connect to your Kuzzle instance.">
            <template #header
              ><img
                src="../../../assets/logo.svg"
                alt="Welcome to the Kuzzle Admin Console"
                height="60"
              />
              <h1 v-if="!$attrs.id">Create a Connection</h1>
              <h1 v-else>Edit a Connection</h1>
            </template>
          </b-jumbotron>

          <create-environment
            ref="createEnvironmentComponent"
            :environment-id="$attrs.id"
            @environment::importEnv="importEnv"
          />

          <template #footer>
            <div class="text-right">
              <b-button
                v-if="hasEnvironment"
                class="mr-3"
                variant="outline-secondary"
                @click="$router.push({ name: 'SelectEnvironment' })"
              >
                Cancel
              </b-button>
              <b-button
                class="CreateEnvironment-import mr-3"
                data-cy="CreateEnvironment-import"
                variant="outline-primary"
                @click="importEnv"
              >
                Import connections
              </b-button>
              <b-button data-cy="Environment-SubmitButton" variant="primary" type="submit">
                {{ $attrs.id ? 'Save' : 'Create' }} connection
              </b-button>
            </div>
          </template>
        </b-card>
      </b-container>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { KKuzzleActionsTypes, StoreNamespaceTypes } from '@/store';

import CreateEnvironment from './CreateEnvironment.vue';

export default {
  name: 'CreateEnvironmentPage',
  components: {
    CreateEnvironment,
  },
  computed: {
    ...mapGetters('kuzzle', ['hasEnvironment', 'environments']),
  },
  methods: {
    async submit() {
      const id = await this.$refs.createEnvironmentComponent.submit();
      if (Object.keys(this.environments).length > 1) {
        this.$router.push({ name: 'SelectEnvironment' });
      } else {
        await this.$store.dispatch(
          `${StoreNamespaceTypes.KUZZLE}/${KKuzzleActionsTypes.SET_CURRENT_ENVIRONMENT}`,
          id,
        );
        this.$router.push('/');
      }
    },
    importEnv() {
      this.$emit('environment::importEnv');
    },
  },
};
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
