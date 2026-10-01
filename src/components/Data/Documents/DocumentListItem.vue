<template>
  <li
    ref="root"
    class="DocumentListView-item realtime-highlight rounded-md border border-border bg-card px-3 py-2"
    :data-cy="`DocumentListItem--${document._id}`"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <button
          :aria-controls="contentId"
          :aria-expanded="expanded"
          :aria-label="expanded ? 'Collapse document' : 'Expand document'"
          class="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          data-cy="DocumentListItem-toggleCollapse"
          type="button"
          @click="toggleCollapse"
        >
          <i aria-hidden="true" :class="`fa fa-caret-${expanded ? 'down' : 'right'}`" />
        </button>
        <Checkbox
          :id="checkboxId"
          v-model="checked"
          :aria-label="`Select document ${document._id}`"
          @update:modelValue="notifyCheckboxClick"
        />
        <a
          class="code cursor-pointer min-w-0 truncate"
          data-cy="DocumentListItem-title"
          @click="toggleCollapse"
          >{{ document._id }}</a
        >
        <Badge
          v-if="!autoSync && notifBadgeText && notifBadgeText !== 'created'"
          :variant="notifBadgeVariant"
          >{{ notifBadgeText }}</Badge
        >
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <Button
          class="DocumentListItem-update"
          :data-cy="`DocumentListItem-update--${document._id}`"
          :disabled="!canEdit"
          size="icon"
          :title="canEdit ? 'Edit Document' : 'You are not allowed to edit this Document'"
          variant="ghost"
          @click="editDocument"
        >
          <i aria-hidden="true" class="fa fa-pencil-alt" />
        </Button>
        <Button
          class="DocumentListItem-delete"
          :data-cy="`DocumentListItem-delete--${document._id}`"
          :disabled="!canDelete"
          size="icon"
          :title="canDelete ? 'Delete Document' : 'You are not allowed to delete this Document'"
          variant="ghost"
          @click="deleteDocument"
        >
          <i aria-hidden="true" class="fa fa-trash" />
        </Button>
      </div>
    </div>
    <div v-show="expanded" :id="contentId" class="DocumentListItem-content mt-2 pl-8">
      <JsonTree :value="formattedDocument" />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import { useRouter } from 'vue-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getBadgeVariant, getBadgeText } from '@/services/documentNotifications';
import { useAuthStore } from '@/stores';
import { dateFromTimestamp } from '@/utils';
import type { DocumentNotification, KuzzleDocument } from './types';

import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';

const props = withDefaults(
  defineProps<{
    autoSync?: boolean;
    collection?: string;
    dateFields: string[];
    document: KuzzleDocument;
    index?: string;
    isChecked?: boolean;
    notification?: DocumentNotification;
  }>(),
  {
    collection: undefined,
    index: undefined,
    notification: undefined,
  },
);

const emit = defineEmits<{
  (e: 'checkbox-click', id: string): void;
  (e: 'delete', id: string): void;
}>();

const router = useRouter();
const authStore = useAuthStore();

// La racine, pour le surlignage temps réel : c'était `this.$el`.
const root = useTemplateRef<HTMLLIElement>('root');

const expanded = ref(false);
const checked = ref(props.isChecked);

watch(
  () => props.isChecked,
  (value) => {
    checked.value = value;
  },
);

watch(
  () => props.notification,
  (n) => {
    if (!props.autoSync || !n) {
      return;
    }
    root.value?.classList.add(getBadgeText(n.action));
    setTimeout(() => root.value?.classList.remove(getBadgeText(n.action)), 200);
  },
);

const notifBadgeVariant = computed(() => getBadgeVariant(props.notification?.action));

const notifBadgeText = computed((): string => {
  if (!props.notification?.action) {
    return '';
  }
  return getBadgeText(props.notification.action);
});

const canEdit = computed((): boolean => {
  if (!props.index || !props.collection) {
    return false;
  }
  return authStore.canEditDocument(props.index, props.collection);
});

const canDelete = computed((): boolean => {
  if (!props.index || !props.collection) {
    return false;
  }
  return authStore.canDeleteDocument(props.index, props.collection);
});

const checkboxId = computed((): string => `checkbox-${props.document._id}`);

const contentId = computed((): string => `collapse-${props.document._id}`);

const formattedDocument = computed(() => {
  // NOTE: This solution (cloning the object) is shitty.
  // The good way to do this is to define a renderer function to apply
  // directly in the JSON formatter. Unfortunately this is not supporter.
  // I strongly encourage to reimplement the JSON formatter in a
  // way that each field can be rendered via a custom renderer function.
  const formatted = cloneDeep(props.document._source);
  props.dateFields.forEach((fieldPath) => {
    const dateObj = dateFromTimestamp(get(formatted, fieldPath) as string | number);
    if (dateObj != null) {
      set(formatted, fieldPath, dateObj.toLocaleString('en-GB'));
    }
  });
  return formatted;
});

function toggleCollapse(): void {
  expanded.value = !expanded.value;
}

function notifyCheckboxClick(): void {
  emit('checkbox-click', props.document._id);
}

function deleteDocument(): void {
  if (canDelete.value) {
    emit('delete', props.document._id);
  }
}

function editDocument(): void {
  if (canEdit.value) {
    router.push({
      name: 'UpdateDocument',
      params: { id: props.document._id },
    });
  }
}
</script>
