<template>
  <div class="tw:flex tw:h-screen tw:items-center tw:justify-center tw:px-4">
    <Card class="tw:w-full tw:max-w-3xl tw:bg-muted">
      <CardHeader class="tw:gap-4">
        <img
          alt="Welcome to the Kuzzle Admin Console"
          class="tw:h-15 tw:w-auto tw:self-start"
          height="60"
          src="../../assets/logo.svg"
        />
        <CardTitle class="tw:text-xl">
          Connecting to Kuzzle at
          <span class="code">{{ host }}:{{ port }}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <hr class="tw:my-2 tw:border-border" />
      </CardContent>

      <CardFooter class="tw:flex-wrap tw:justify-between tw:gap-4">
        <Spinner class="tw:text-muted-foreground" label="Connecting to Kuzzle" />
        <div class="tw:flex tw:items-center tw:gap-3">
          <span class="tw:text-sm tw:text-muted-foreground">Connection:</span>
          <environment-switch
            @environment::create="editEnvironment"
            @environment::delete="deleteEnvironment"
            @environment::importEnv="importEnv"
          />
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script>
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useKuzzleStore } from '@/stores';

import EnvironmentSwitch from './Environments/EnvironmentsSwitch.vue';

export default {
  name: 'OfflinePage',
  components: {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    EnvironmentSwitch,
    Spinner,
  },
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
    };
  },
  computed: {
    currentEnvironment() {
      return this.kuzzleStore.currentEnvironment;
    },
    host() {
      return this.currentEnvironment ? this.currentEnvironment.host : '';
    },
    port() {
      return this.currentEnvironment ? this.currentEnvironment.port : '';
    },
    errorInternalMessage() {
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
