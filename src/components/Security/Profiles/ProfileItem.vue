<template>
  <div class="px-3" data-cy="ProfileItem">
    <div class="flex items-center gap-2 py-1">
      <i
        aria-hidden="true"
        class="fa cursor-pointer px-1"
        :class="`fa-caret-${expanded ? 'down' : 'right'}`"
        :data-cy="`ProfileItem-${document._id}--toggle`"
        @click="toggleCollapse"
      />
      <Checkbox
        :id="checkboxId"
        v-model="checked"
        :aria-label="`Select profile ${document._id}`"
        :data-cy="`ProfileListItem-checkbox--${document._id}`"
        @change="notifyCheckboxClick"
      />
      <a class="code cursor-pointer" @click="toggleCollapse">{{ document._id }}</a>
      <span
        v-if="document.additionalAttribute && document.additionalAttribute.value"
        class="text-sm italic text-muted-foreground"
      >
        ({{ document.additionalAttribute.name }}: {{ document.additionalAttribute.value }})
      </span>

      <div class="ms-auto flex items-center">
        <Button
          class="ProfileListItem-update"
          :data-cy="`ProfileListItem-update--${document._id}`"
          :disabled="!authStore.canEditProfile"
          size="icon"
          :title="
            authStore.canEditProfile ? 'Edit Profile' : 'You are not allowed to edit this profile'
          "
          variant="ghost"
          @click.prevent="update"
        >
          <i class="fa fa-pencil-alt" aria-hidden="true" />
        </Button>
        <Button
          class="ProfileListItem-delete"
          :data-cy="`ProfileListItem-delete--${document._id}`"
          :disabled="!authStore.canDeleteProfile"
          size="icon"
          :title="
            authStore.canDeleteProfile
              ? 'Delete profile'
              : 'You are not allowed to delete this profile'
          "
          variant="ghost"
          @click.prevent="deleteDocument"
        >
          <i class="fa fa-trash" aria-hidden="true" />
        </Button>
      </div>
    </div>

    <div
      v-show="expanded"
      :id="`collapse-${document._id}`"
      :data-cy="`ProfileListItem-collapse--${document._id}`"
      class="ProfileItem-content ms-3 mt-3 max-h-75 overflow-y-auto"
    >
      <JsonTree :value="document" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores';
import type { ProfileDocument } from './types';

import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';

const props = defineProps<{
  document: ProfileDocument;
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

const checkboxId = computed(() => `checkbox-${props.document._id}`);

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
  if (authStore.canDeleteProfile) {
    emit('delete', props.document._id);
  }
}
function update(): void {
  if (authStore.canEditProfile) {
    emit('edit', props.document._id);
  }
}
</script>
