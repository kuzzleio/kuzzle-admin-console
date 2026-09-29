<template>
  <div class="flex h-screen items-center justify-center px-4">
    <Card class="w-full max-w-3xl bg-muted">
      <CardHeader class="gap-4">
        <KuzzleLogo
          alt="Welcome to the Kuzzle Admin Console"
          class="h-15 w-auto self-start"
          height="60"
        />
        <CardTitle class="font-heading text-headline font-extrabold">
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

<script setup lang="ts">
import { computed } from 'vue';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useKuzzleStore } from '@/stores';

import EnvironmentSwitch from './Environments/EnvironmentsSwitch.vue';
import KuzzleLogo from './KuzzleLogo.vue';

const emit = defineEmits<{
  (e: 'environment::create', id: string): void;
  (e: 'environment::delete', id: string): void;
  (e: 'environment::importEnv'): void;
}>();

const kuzzleStore = useKuzzleStore();

const currentEnvironment = computed(() => kuzzleStore.currentEnvironment);
const host = computed(() => (currentEnvironment.value ? currentEnvironment.value.host : ''));
const port = computed(() => (currentEnvironment.value ? currentEnvironment.value.port : ''));
const errorInternalMessage = computed(() => kuzzleStore.errorFromKuzzle);

function editEnvironment(id: string): void {
  emit('environment::create', id);
}

function deleteEnvironment(id: string): void {
  emit('environment::delete', id);
}

function importEnv(): void {
  emit('environment::importEnv');
}
</script>
