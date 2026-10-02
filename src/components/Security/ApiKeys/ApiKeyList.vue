<template>
  <div class="ApiKeyList flex flex-col gap-4" data-cy="ApiKeyList">
    <Card v-if="!backendSupportsApiKeys" data-cy="ApiKeyList-unsupported">
      <CardContent>
        <CardTitle class="font-heading font-extrabold">API keys require Kuzzle 2</CardTitle>
        <CardDescription class="mt-2">
          This connection targets a Kuzzle 1 backend, which has no API keys.
        </CardDescription>
      </CardContent>
    </Card>

    <ListNotAllowed v-else-if="!canSearch" />

    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <Input
          v-model="filter"
          aria-label="Filter API keys by description"
          class="max-w-sm"
          data-cy="ApiKeyList-filter"
          placeholder="Filter by description"
          type="search"
        />
        <Button
          data-cy="ApiKeyList-createBtn"
          :disabled="!canCreate"
          :title="canCreate ? undefined : 'You are not allowed to create API keys'"
          @click="creating = true"
        >
          Create API key
        </Button>
      </div>

      <MainSpinner v-if="loading" class="my-8" />

      <Card v-else-if="keys.length === 0" class="EmptyState" data-cy="ApiKeyList-empty">
        <CardContent class="flex flex-col items-center text-center">
          <i class="fas fa-key fa-4x mb-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle class="font-heading text-headline font-extrabold text-muted-foreground">
            No API key
          </CardTitle>
          <CardDescription v-if="canCreate" class="mt-2">
            An API key lets an application or a script call Kuzzle as
            <span class="code">{{ ownerLabel }}</span
            >, without a password.
          </CardDescription>
        </CardContent>
      </Card>

      <template v-else>
        <Table data-cy="ApiKeyList-table">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead class="hidden md:table-cell">Fingerprint</TableHead>
              <TableHead class="w-0"><span class="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="key of filteredKeys"
              :key="key.id"
              :data-cy="`ApiKeyList-row--${key.id}`"
            >
              <TableCell class="font-medium" data-cy="ApiKeyList-description">
                {{ key.description }}
              </TableCell>
              <TableCell class="whitespace-nowrap" data-cy="ApiKeyList-expiration">
                <Badge v-if="key.expiresAt === -1" variant="warning">Never</Badge>
                <span v-else-if="isExpired(key, now)" :title="exactDate(key)">
                  <Badge variant="destructive">Expired</Badge>
                  <span class="ms-2 text-muted-foreground">{{
                    formatRelative(key.expiresAt, now)
                  }}</span>
                </span>
                <span v-else :title="exactDate(key)">{{ formatRelative(key.expiresAt, now) }}</span>
              </TableCell>
              <!-- Sous `md`, l'empreinte cède la place : la description et l'échéance d'abord. -->
              <TableCell class="hidden md:table-cell">
                <span class="code" :title="key.fingerprint">{{
                  key.fingerprint.slice(0, 12)
                }}</span>
              </TableCell>
              <TableCell>
                <Button
                  :aria-label="`Revoke ${key.description}`"
                  :data-cy="`ApiKeyList-revoke--${key.id}`"
                  :disabled="!canDelete"
                  size="icon"
                  :title="canDelete ? 'Revoke' : 'You are not allowed to revoke API keys'"
                  variant="ghost"
                  @click="revokeCandidate = key"
                >
                  <i class="fa fa-trash" aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <p
          v-if="filteredKeys.length === 0"
          class="text-muted-foreground"
          data-cy="ApiKeyList-noMatch"
        >
          No API key matches this description.
        </p>
        <p v-if="total > keys.length" class="text-sm text-muted-foreground">
          Showing the first {{ keys.length }} of {{ total }} API keys.
        </p>
      </template>
    </template>

    <CreateApiKeyModal
      v-model:open="creating"
      :owner-label="ownerLabel"
      :scope="scope"
      @created="load"
    />
    <RevokeApiKeyModal
      :api-key="revokeCandidate"
      :revoking="revoking"
      @cancel="revokeCandidate = null"
      @confirm="revoke"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/composables/useToast';
import { formatDateTime } from '@/lib/date';
import { caught } from '@/lib/errors';
import { logger } from '@/lib/logger';
import {
  type ApiKey,
  type ApiKeyScope,
  deleteApiKey,
  formatRelative,
  isExpired,
  searchApiKeys,
} from '@/services/apiKeys';
import { useKuzzleStore } from '@/stores';

import ListNotAllowed from '@/components/Common/ListNotAllowed.vue';
import MainSpinner from '@/components/Common/MainSpinner.vue';
import CreateApiKeyModal from './CreateApiKeyModal.vue';
import RevokeApiKeyModal from './RevokeApiKeyModal.vue';

/*
 * Les clés d'API d'une portée (ADR-0070) : celles d'un utilisateur, ou les
 * siennes. Les droits viennent du site d'appel, qui sait quel contrôleur
 * s'applique.
 */
const props = defineProps<{
  canCreate: boolean;
  canDelete: boolean;
  canSearch: boolean;
  /** Le titulaire des clés, tel qu'on le nomme dans les textes. */
  ownerLabel: string;
  scope: ApiKeyScope;
}>();

const kuzzleStore = useKuzzleStore();
const toast = useToast();

const keys = ref<ApiKey[]>([]);
const total = ref(0);
const loading = ref(false);
const filter = ref('');
const creating = ref(false);
const revokeCandidate = ref<ApiKey | null>(null);
const revoking = ref(false);
/* L'instant de référence des échéances, relevé à chaque chargement : une clé
   qui expire pendant qu'on regarde la page passe « expirée » au suivant. */
const now = ref(Date.now());

const backendSupportsApiKeys = computed(
  () => (kuzzleStore.currentEnvironment?.backendMajorVersion ?? 0) > 1,
);

const filteredKeys = computed(() => {
  const text = filter.value.trim().toLowerCase();
  return text === ''
    ? keys.value
    : keys.value.filter((key) => key.description.toLowerCase().includes(text));
});

function sdk() {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    throw new Error('No Kuzzle SDK for the current environment');
  }
  return kuzzle;
}

function exactDate(key: ApiKey): string {
  return formatDateTime(new Date(key.expiresAt));
}

async function load(): Promise<void> {
  if (!backendSupportsApiKeys.value || !props.canSearch) {
    return;
  }
  loading.value = true;
  try {
    const result = await searchApiKeys(sdk(), props.scope);
    // L'ordre de Kuzzle n'est pas garanti, et il n'y a pas de date de
    // création : la liste suit les descriptions.
    keys.value = [...result.hits].sort((a, b) => a.description.localeCompare(b.description));
    total.value = result.total;
    now.value = Date.now();
  } catch (error) {
    logger.error(error);
    toast.danger('Unable to load the API keys', caught(error).message);
  } finally {
    loading.value = false;
  }
}

async function revoke(key: ApiKey): Promise<void> {
  revoking.value = true;
  try {
    await deleteApiKey(sdk(), props.scope, key.id);
    revokeCandidate.value = null;
    toast.success('API key revoked', key.description);
    await load();
  } catch (error) {
    logger.error(error);
    toast.danger('Unable to revoke the API key', caught(error).message);
  } finally {
    revoking.value = false;
  }
}

onMounted(load);
watch(() => props.scope, load, { deep: true });
</script>
