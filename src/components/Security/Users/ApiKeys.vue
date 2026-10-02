<template>
  <div class="UserApiKeys mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
      <Headline>
        API keys - <span class="code" data-cy="UserApiKeys-kuid">{{ id }}</span>
      </Headline>
      <Button
        :as="RouterLink"
        data-cy="UserApiKeys-editUser"
        :to="{ name: 'SecurityUsersUpdate', params: { id } }"
        variant="outline"
      >
        Edit user
      </Button>
    </div>

    <ApiKeyList
      :can-create="authStore.canCreateApiKey"
      :can-delete="authStore.canDeleteApiKey"
      :can-search="authStore.canSearchApiKeys"
      :owner-label="id"
      :scope="scope"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import Headline from '../../Materialize/Headline.vue';
import ApiKeyList from '../ApiKeys/ApiKeyList.vue';
import { Button } from '@/components/ui/button';
import type { ApiKeyScope } from '@/services/apiKeys';
import { useAuthStore } from '@/stores';

// Les clés d'un utilisateur, par le contrôleur `security` (ADR-0070).
const props = defineProps<{
  id: string;
}>();

const authStore = useAuthStore();

const scope = computed((): ApiKeyScope => ({ controller: 'security', userId: props.id }));
</script>
