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
      <JsonTree :value="document" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores';
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

const expanded = ref(false);
const checked = ref(false);

const profileList = computed(() => {
  if (!props.document.profileIds) {
    return [];
  }
  return [...props.document.profileIds].sort();
});
const checkboxId = computed(() => `checkbox-${props.document.id}`);
const localStrategyUsername = computed(() => {
  const local = props.document.credentials?.local;
  return local ? local.username : null;
});

watch(
  () => props.isChecked,
  (value) => {
    checked.value = value;
  },
);

function profileRoute(profile: string) {
  return { name: 'SecurityProfilesUpdate', params: { id: profile } };
}
function toggleCollapse(): void {
  expanded.value = !expanded.value;
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
