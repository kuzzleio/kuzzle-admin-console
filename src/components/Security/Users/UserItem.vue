<template>
  <div class="UserItem px-3" data-cy="UserItem">
    <div class="flex flex-row items-center gap-2 py-1">
      <i
        aria-hidden="true"
        class="fa cursor-pointer px-1"
        :class="`fa-caret-${expanded ? 'down' : 'right'}`"
        :data-cy="`UserItem-${document.id}--toggle`"
        @click="toggleCollapse"
      />
      <Checkbox
        :id="checkboxId"
        v-model="checked"
        :aria-label="`Select user ${document.id}`"
        class="me-2"
        :data-cy="`UserListItem-checkbox--${document.id}`"
        @change="notifyCheckboxClick"
      />

      <div class="grow">
        <div class="flex flex-wrap items-center gap-2">
          <a class="code cursor-pointer" @click="toggleCollapse">{{ document.id }}</a>
          <span
            v-if="localStrategyUsername"
            class="code"
            :data-cy="`local-strategy-username-${localStrategyUsername}`"
          >
            <i class="fas fa-user text-muted-foreground" title="Username (local strategy)" />
            {{ localStrategyUsername }}
          </span>
          <span
            v-if="document.additionalAttribute && document.additionalAttribute.value"
            class="cursor-pointer text-sm italic text-muted-foreground"
            @click="toggleCollapse"
            >({{ document.additionalAttribute.name }}:
            {{ document.additionalAttribute.value }})</span
          >
        </div>
        <div class="flex flex-row flex-wrap gap-1 py-1">
          <Badge v-for="profile in profileList" :key="profile" variant="info">
            <router-link class="truncate" :to="profileRoute(profile)">{{ profile }}</router-link>
          </Badge>
        </div>
      </div>

      <div class="flex flex-nowrap items-center">
        <Button
          v-if="showApiKeys"
          :as="RouterLink"
          :aria-label="`API keys of ${document.id}`"
          :data-cy="`UserListItem-apiKeys--${document.id}`"
          size="icon"
          title="API keys"
          :to="{ name: 'SecurityUsersApiKeys', params: { id: document.id } }"
          variant="ghost"
        >
          <i class="fa fa-key" aria-hidden="true" />
        </Button>
        <Button
          class="UserListItem-update"
          :data-cy="`UserListItem-update--${document.id}`"
          :disabled="!authStore.canEditUser"
          size="icon"
          :title="authStore.canEditUser ? 'Edit User' : 'You are not allowed to edit this user'"
          variant="ghost"
          @click.prevent="update"
        >
          <i class="fa fa-pencil-alt" aria-hidden="true" />
        </Button>
        <Button
          class="UserListItem-delete"
          :data-cy="`UserListItem-delete--${document.id}`"
          :disabled="!authStore.canDeleteUser"
          size="icon"
          :title="
            authStore.canDeleteUser ? 'Delete user' : 'You are not allowed to delete this user'
          "
          variant="ghost"
          @click.prevent="deleteDocument"
        >
          <i class="fa fa-trash" aria-hidden="true" />
        </Button>
      </div>
    </div>

    <div v-show="expanded" :id="`collapse-${document.id}`" class="DocumentListItem-content ms-3">
      <JsonTree :value="expandedDocument" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { logger } from '@/lib/logger';
import { useAuthStore, useKuzzleStore } from '@/stores';
import type { UserDocument } from './types';

import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';

const props = defineProps<{
  document: UserDocument;
  isChecked: boolean;
}>();

const emit = defineEmits<{
  (e: 'checkbox-click', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'edit', id: string): void;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();

const expanded = ref(false);
const checked = ref(false);
/* Les identifiants de toutes les stratégies, chargés au premier dépliage :
   la liste n'a que `local`, seul affiché ligne repliée. */
const fullCredentials = ref<UserDocument['credentials'] | null>(null);
const expandedDocument = computed<UserDocument>(() =>
  fullCredentials.value
    ? { ...props.document, credentials: fullCredentials.value }
    : props.document,
);

const profileList = computed(() => {
  if (!props.document.profileIds) {
    return [];
  }
  return [...props.document.profileIds].sort();
});
// Les clés d'API n'existent qu'à partir de Kuzzle 2 (ADR-0070).
const showApiKeys = computed(
  () =>
    authStore.canSearchApiKeys && (kuzzleStore.currentEnvironment?.backendMajorVersion ?? 0) > 1,
);
const checkboxId = computed(() => `checkbox-${props.document.id}`);
const localStrategyUsername = computed(() => {
  const local = props.document.credentials?.local;
  return local ? local.username : null;
});

// La liste recharge ses documents (suppression, filtre) : ce qui a été
// chargé au dépliage ne vaut plus.
watch(
  () => props.document,
  () => {
    fullCredentials.value = null;
    if (expanded.value) {
      void loadCredentials();
    }
  },
);

watch(
  () => props.isChecked,
  (value) => {
    checked.value = value;
  },
);

function profileRoute(profile: string) {
  return { name: 'SecurityProfilesUpdate', params: { id: profile } };
}
async function loadCredentials(): Promise<void> {
  const wrapper = kuzzleStore.wrapper;
  if (!wrapper) {
    return;
  }
  const document = props.document;
  try {
    const credentials = await wrapper.getUserCredentials(document.id);
    // La liste a pu recharger ses documents pendant la requête.
    if (props.document === document) {
      fullCredentials.value = credentials as UserDocument['credentials'];
    }
  } catch (error) {
    // Le JSON garde alors les identifiants `local` venus de la liste.
    logger.error(error);
  }
}
function toggleCollapse(): void {
  expanded.value = !expanded.value;
  if (expanded.value && !fullCredentials.value) {
    void loadCredentials();
  }
}
function notifyCheckboxClick(): void {
  emit('checkbox-click', props.document.id);
}
function deleteDocument(): void {
  if (authStore.canDeleteUser) {
    emit('delete', props.document.id);
  }
}
function update(): void {
  if (authStore.canEditUser) {
    emit('edit', props.document.id);
  }
}
</script>
