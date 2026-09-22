<template>
  <li
    class="DocumentListView-item realtime-highlight rounded-md border border-border bg-card px-3 py-2"
    :data-cy="`DocumentListItem--${document._id}`"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <button
          :aria-controls="contentId"
          :aria-expanded="String(expanded)"
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
          class="code pointer min-w-0 truncate"
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
      <pre v-json-formatter="{ content: formattedDocument, open: true }" class="text-base" />
    </div>
  </li>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import { mapState } from 'pinia';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import JsonFormatter from '@/directives/json-formatter.directive';
import { getBadgeVariant, getBadgeText } from '@/services/documentNotifications';
import { useAuthStore } from '@/stores';
import { dateFromTimestamp } from '@/utils';

export default {
  name: 'DocumentListItem',
  components: {
    Badge,
    Button,
    Checkbox,
  },
  directives: {
    JsonFormatter,
  },
  props: {
    autoSync: Boolean,
    index: String,
    collection: String,
    document: Object,
    isChecked: Boolean,
    notification: Object,
    dateFields: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      expanded: false,
      checked: this.isChecked,
    };
  },
  watch: {
    isChecked: {
      handler(value) {
        this.checked = value;
      },
    },
    notification: {
      handler(n) {
        if (!this.autoSync || !n) {
          return;
        }
        this.$el.classList.add(getBadgeText(n.action));
        setTimeout(() => this.$el.classList.remove(getBadgeText(n.action)), 200);
      },
    },
  },
  computed: {
    ...mapState(useAuthStore, ['canEditDocument', 'canDeleteDocument']),
    notifBadgeVariant() {
      return getBadgeVariant(get(this.notification, 'action'));
    },
    notifBadgeText() {
      if (!get(this.notification, 'action')) {
        return '';
      }
      return getBadgeText(get(this.notification, 'action'));
    },
    canEdit() {
      if (!this.index || !this.collection) {
        return false;
      }
      return this.canEditDocument(this.index, this.collection);
    },
    canDelete() {
      if (!this.index || !this.collection) {
        return false;
      }
      return this.canDeleteDocument(this.index, this.collection);
    },
    checkboxId() {
      return `checkbox-${this.document._id}`;
    },
    contentId() {
      return `collapse-${this.document._id}`;
    },
    formattedDocument() {
      // NOTE: This solution (cloning the object) is shitty.
      // The good way to do this is to define a renderer function to apply
      // directly in the JSON formatter. Unfortunately this is not supporter.
      // I strongly encourage to reimplement the JSON formatter in a
      // way that each field can be rendered via a custom renderer function.
      const formatted = cloneDeep(this.document._source);
      this.dateFields.forEach((fieldPath) => {
        const dateObj = dateFromTimestamp(get(formatted, fieldPath));
        if (dateObj != null) {
          set(formatted, fieldPath, dateObj.toLocaleString('en-GB'));
        }
      });
      return formatted;
    },
  },
  methods: {
    toggleCollapse() {
      this.expanded = !this.expanded;
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document._id);
    },
    deleteDocument() {
      if (this.canDelete) {
        this.$emit('delete', this.document._id);
      }
    },
    editDocument() {
      if (this.canEdit) {
        this.$router.push({
          name: 'UpdateDocument',
          params: { id: this.document._id },
        });
      }
    },
  },
};
</script>
