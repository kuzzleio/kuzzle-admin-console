<template>
  <div class="px-3" data-cy="RoleItem">
    <div class="flex items-center gap-2 py-1">
      <i
        aria-hidden="true"
        class="fa cursor-pointer px-1"
        :class="`fa-caret-${expanded ? 'down' : 'right'}`"
        :data-cy="`RoleItem-${document._id}--toggle`"
        @click="toggleCollapse"
      />
      <Checkbox
        v-model="checked"
        :aria-label="`Select role ${document._id}`"
        :data-cy="`RoleItem-checkbox--${document._id}`"
        @change="notifyCheckboxClick"
      />
      <a class="code cursor-pointer" @click="toggleCollapse">{{ document._id }}</a>

      <div class="ms-auto flex items-center">
        <Button
          class="RoleItem-update"
          :data-cy="`RoleItem-update--${document._id}`"
          :disabled="!authStore.canEditRole"
          size="icon"
          :title="authStore.canEditRole ? 'Edit Role' : 'You are not allowed to edit this role'"
          variant="ghost"
          @click.prevent="update"
        >
          <i class="fa fa-pencil-alt" aria-hidden="true" />
        </Button>
        <Button
          class="RoleItem-delete"
          :data-cy="`RoleItem-delete--${document._id}`"
          :disabled="!authStore.canDeleteRole"
          size="icon"
          :title="
            authStore.canDeleteRole ? 'Delete role' : 'You are not allowed to delete this role'
          "
          variant="ghost"
          @click.prevent="deleteDocument"
        >
          <i class="fa fa-trash" aria-hidden="true" />
        </Button>
      </div>
    </div>

    <div v-show="expanded" class="RoleItem-content ms-3 mt-3">
      <JsonTree :value="document" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores';
import type { RoleDocument } from './types';

import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';

const props = defineProps<{
  document: RoleDocument;
  isChecked: boolean;
}>();

const emit = defineEmits<{
  (e: 'checkbox-click', id: string): void;
  (e: 'common-list::edit-document', route: string, id: string): void;
  (e: 'delete-document', id: string): void;
}>();

const authStore = useAuthStore();

const expanded = ref(false);
const checked = ref(false);

watch(
  () => props.isChecked,
  (value) => {
    checked.value = value;
  },
);

function toggleCollapse(): void {
  expanded.value = !expanded.value;
}
function notifyCheckboxClick(): void {
  emit('checkbox-click', props.document._id);
}
function deleteDocument(): void {
  if (authStore.canDeleteRole) {
    emit('delete-document', props.document._id);
  }
}
function update(): void {
  if (authStore.canEditRole) {
    emit('common-list::edit-document', 'SecurityRolesUpdate', props.document._id);
  }
}
</script>
