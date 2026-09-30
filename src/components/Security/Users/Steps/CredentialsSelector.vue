<template>
  <div class="Credentials flex flex-wrap gap-4">
    <strong class="w-full sm:w-40">Credentials</strong>

    <Card class="Credentials-selector min-w-0 flex-1">
      <CardContent>
        <!--
          `b-tabs` avait un slot `#empty`. La primitive n'en a pas : une barre
          d'onglets vide n'est pas un cas particulier du composant, c'est un
          cas particulier de l'écran.
        -->
        <div v-if="strategies.length === 0" class="text-center text-muted-foreground">
          No strategies found<br />
          It looks like no authentication strategies are installed on your Kuzzle instance.
        </div>

        <Tabs v-else :default-value="strategies[0]" orientation="vertical">
          <div class="flex flex-col gap-2">
            <span class="px-3 text-sm text-muted-foreground">Auth strategies</span>
            <TabsList>
              <TabsTrigger
                v-for="strategy in strategies"
                :key="strategy"
                :data-cy="`CredentialsSelector-tab--${strategy}`"
                :value="strategy"
              >
                {{ strategy }}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            v-for="strategy in strategies"
            :key="strategy"
            class="flex flex-col gap-4 px-3"
            :value="strategy"
          >
            <FormItem v-for="fieldName in credentialsMapping[strategy]" :key="fieldName">
              <Label :for="`${strategy}-${fieldName}`">{{ getFieldHelp(fieldName) }}</Label>
              <Input
                :id="`${strategy}-${fieldName}`"
                :data-cy="`CredentialsSelector-${strategy}-${fieldName}`"
                :model-value="getValue(strategy, fieldName) || ''"
                :name="fieldName"
                :type="fieldType(fieldName)"
                @update:model-value="onFieldChange(strategy, fieldName, $event)"
              />
            </FormItem>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { Credentials } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const props = withDefaults(
  defineProps<{
    credentials?: Credentials;
    credentialsMapping?: Record<string, string[]>;
    strategies?: string[];
  }>(),
  { credentials: () => ({}), credentialsMapping: () => ({}), strategies: () => [] },
);

const emit = defineEmits<{
  (e: 'input', payload: { credentials: Record<string, string | number>; strategy: string }): void;
}>();

function getValue(strategy: string, fieldName: string): string | number | null {
  if (!props.credentials[strategy]) {
    return null;
  }
  return props.credentials[strategy][fieldName];
}

function getFieldHelp(fieldName: string): string {
  return fieldName.replace(/^\w/, (c) => c.toUpperCase());
}

function fieldType(fieldName: string): string {
  if (fieldName === 'password') {
    return 'password';
  }
  return 'text';
}

function onFieldChange(strategy: string, fieldName: string, value: string | number): void {
  emit('input', {
    strategy,
    credentials: {
      ...props.credentials[strategy],
      [fieldName]: value,
    },
  });
}
</script>
