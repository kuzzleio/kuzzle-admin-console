<template>
  <div class="h-screen overflow-auto">
    <div class="flex min-h-full justify-center px-4 py-6">
      <Card class="my-auto w-full max-w-3xl shadow-signature">
        <CardHeader class="gap-4">
          <KuzzleLogo
            alt="Welcome to the Kuzzle Admin Console"
            class="h-15 w-auto self-start"
            height="60"
          />
          <CardTitle class="font-display text-display font-bold uppercase">Select Kuzzle</CardTitle>
          <CardDescription class="text-base">
            Please select a Kuzzle instance to connect to.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <hr class="border-border" />
        </CardContent>

        <CardFooter class="flex-wrap justify-end gap-4">
          <span class="text-sm text-muted-foreground">Connect to</span>
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

<script setup lang="ts">
import { useRouter } from 'vue-router';

import KuzzleLogo from '../KuzzleLogo.vue';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import EnvironmentSelector from './EnvironmentsSwitch.vue';

defineEmits<{
  (e: 'environment::create', id?: string): void;
  (e: 'environment::delete', id: string): void;
  (e: 'environment::importEnv'): void;
}>();

const router = useRouter();

function onEnvSwitched(): void {
  router.push({ path: '/' });
}
</script>
