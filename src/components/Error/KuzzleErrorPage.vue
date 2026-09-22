<template>
  <div class="KuzzleErrorPage flex min-h-screen items-center justify-center p-4">
    <Card class="w-full max-w-4xl">
      <CardContent>
        <header class="rounded-md bg-muted p-8">
          <img
            alt="Welcome to the Kuzzle Admin Console"
            class="mb-4 h-15 w-auto"
            height="60"
            src="../../assets/logo.svg"
          />
          <h2 class="text-2xl font-bold text-foreground">
            Something went wrong while connecting to Kuzzle
          </h2>

          <hr class="my-6 border-border" />

          <div class="flex flex-wrap items-center gap-3">
            <span class="code min-w-0 flex-1 break-words">{{ kuzzleError }}</span>
            <span class="text-sm text-muted-foreground">Connecting to</span>
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
