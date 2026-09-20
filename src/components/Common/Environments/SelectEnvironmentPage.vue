<template>
  <div class="tw:h-screen tw:overflow-auto">
    <div class="tw:flex tw:min-h-full tw:justify-center tw:px-4 tw:py-6">
      <Card class="tw:my-auto tw:w-full tw:max-w-3xl">
        <CardHeader class="tw:gap-4">
          <img
            alt="Welcome to the Kuzzle Admin Console"
            class="tw:h-15 tw:w-auto tw:self-start"
            height="60"
            src="../../../assets/logo.svg"
          />
          <CardTitle class="tw:text-3xl">Select Kuzzle</CardTitle>
          <CardDescription class="tw:text-base">
            Please select a Kuzzle instance to connect to.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <hr class="tw:border-border" />
        </CardContent>

        <CardFooter class="tw:flex-wrap tw:justify-end tw:gap-4">
          <span class="tw:text-sm tw:text-muted-foreground">Connect to</span>
          <environment-selector
            @environment::create="$emit('environment::create', $event)"
            @environment::delete="$emit('environment::delete', $event)"
            @environment::importEnv="$emit('environment::importEnv')"
            @environmentSwitched="onEnvSwitched"
          />
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import EnvironmentSelector from './EnvironmentsSwitch.vue';

export default defineComponent({
  name: 'SelectEnvironmentPage',
  components: {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    EnvironmentSelector,
  },
  methods: {
    onEnvSwitched() {
      this.$router.push({ path: '/' });
    },
  },
});
</script>
