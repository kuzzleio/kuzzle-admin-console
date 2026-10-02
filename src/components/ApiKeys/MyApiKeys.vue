<template>
  <div class="MyApiKeys mx-auto w-full max-w-6xl overflow-auto px-4 py-6 pb-12">
    <Headline>My API keys</Headline>

    <ApiKeyList
      :can-create="authStore.canCreateOwnApiKey"
      :can-delete="authStore.canDeleteOwnApiKey"
      :can-search="authStore.canSearchOwnApiKeys"
      :owner-label="String(authStore.user?.id ?? '')"
      :scope="scope"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiKeyScope } from '@/services/apiKeys';
import { useAuthStore } from '@/stores';

import Headline from '@/components/Materialize/Headline.vue';
import ApiKeyList from '@/components/Security/ApiKeys/ApiKeyList.vue';

/*
 * Les clés de l'utilisateur connecté, par le contrôleur `auth` (ADR-0070) :
 * un développeur sans droit sur `security` crée ainsi les siennes.
 */
const authStore = useAuthStore();

const scope: ApiKeyScope = { controller: 'auth' };
</script>
