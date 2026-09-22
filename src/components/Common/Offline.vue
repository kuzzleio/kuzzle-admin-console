<template>
  <div class="flex h-screen items-center justify-center px-4">
    <Card class="w-full max-w-3xl bg-muted">
      <CardHeader class="gap-4">
        <img
          alt="Welcome to the Kuzzle Admin Console"
          class="h-15 w-auto self-start"
          height="60"
          src="../../assets/logo.svg"
        />
        <CardTitle class="text-xl">
          Connecting to Kuzzle at
          <span class="code">{{ host }}:{{ port }}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <hr class="my-2 border-border" />
      </CardContent>

      <CardFooter class="flex-wrap justify-between gap-4">
        <Spinner class="text-muted-foreground" label="Connecting to Kuzzle" />
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted-foreground">Connection:</span>
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
