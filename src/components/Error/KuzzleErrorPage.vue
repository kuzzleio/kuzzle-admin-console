<template>
  <div class="KuzzleErrorPage">
    <b-container>
      <b-jumbotron>
        <template #header>
          <img
            alt="Welcome to the Kuzzle Admin Console"
            class="mb-3"
            height="60"
            src="../../assets/logo.svg"
          />
          <h2>Something went wrong while connecting to Kuzzle</h2>
        </template>

        <hr class="my-4" />

        <b-row align-v="center">
          <b-col sm="7" class="align-middle code">{{ kuzzleError }}</b-col>
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
    </b-container>
  </div>
</template>

<script>
import { useKuzzleStore } from '@/stores';

import EnvironmentSwitch from '@/components/Common/Environments/EnvironmentsSwitch.vue';

export default {
  name: 'KuzzleErrorPage',
  components: {
    EnvironmentSwitch,
  },
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      host: null,
      port: null,
    };
  },
  computed: {
    kuzzleError() {
      return this.kuzzleStore.errorFromKuzzle;
    },
  },
  methods: {
    editEnvironment(id) {
      this.$emit('environment::create', id);
    },
    deleteEnvironment(id) {
      this.$emit('environment::delete', id);
    },
    importEnv() {
      this.$emit('environment::importEnv');
    },
  },
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.KuzzleErrorPage {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
