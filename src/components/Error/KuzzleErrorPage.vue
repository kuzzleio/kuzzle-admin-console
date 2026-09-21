<template>
  <div class="KuzzleErrorPage tw:flex tw:min-h-screen tw:items-center tw:justify-center tw:p-4">
    <Card class="tw:w-full tw:max-w-4xl">
      <CardContent>
        <header class="tw:rounded-md tw:bg-muted tw:p-8">
          <img
            alt="Welcome to the Kuzzle Admin Console"
            class="tw:mb-4 tw:h-15 tw:w-auto"
            height="60"
            src="../../assets/logo.svg"
          />
          <h2 class="tw:text-2xl tw:font-bold tw:text-foreground">
            Something went wrong while connecting to Kuzzle
          </h2>

          <hr class="tw:my-6 tw:border-border" />

          <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-3">
            <span class="code tw:min-w-0 tw:flex-1 tw:break-words">{{ kuzzleError }}</span>
            <span class="tw:text-sm tw:text-muted-foreground">Connecting to</span>
            <environment-switch
              :block="false"
              @environment::create="editEnvironment"
              @environment::delete="deleteEnvironment"
              @environment::importEnv="importEnv"
            />
          </div>
        </header>
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { Card, CardContent } from '@/components/ui/card';
import { useKuzzleStore } from '@/stores';

import EnvironmentSwitch from '@/components/Common/Environments/EnvironmentsSwitch.vue';

export default {
  name: 'KuzzleErrorPage',
  components: {
    Card,
    CardContent,
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
