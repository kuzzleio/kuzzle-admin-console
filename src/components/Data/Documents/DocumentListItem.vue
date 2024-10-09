<template>
  <b-list-group-item
    class="DocumentListView-item p-2 realtime-highlight"
    :data-cy="`DocumentListItem-${document._id}`"
  >
    <b-container fluid>
      <b-row align-h="between" no-gutters>
        <b-col cols="10" class="py-1">
          <i
            aria-hidden="true"
            data-cy="DocumentListItem-toggleCollapse"
            :class="`fa fa-caret-${expanded ? 'down' : 'right'} mr-2  d-inline-block align-middle`"
            @click="toggleCollapse"
          />
          <b-form-checkbox
            :id="checkboxId"
            v-model="checked"
            class="d-inline-block align-middle"
            type="checkbox"
            value="true"
            unchecked-value="false"
            @change="notifyCheckboxClick"
          />
          <a class="d-inline-block align-middle code pointer" @click="toggleCollapse">{{
            document._id
          }}</a>
          <b-badge
            v-if="!autoSync && notifBadgeText && notifBadgeText !== 'created'"
            :variant="notifBadgeVariant"
            class="mx-2"
            >{{ notifBadgeText }}
          </b-badge>
        </b-col>
        <b-col cols="2">
          <div class="float-right">
            <b-button
              class="DocumentListItem-update"
              href=""
              variant="link"
              :data-cy="`DocumentListItem-update--${document._id}`"
              :disabled="!canEdit"
              :title="canEdit ? 'Edit Document' : 'You are not allowed to edit this Document'"
              @click.prevent="editDocument"
            >
              <i class="fa fa-pencil-alt" :class="{ disabled: !canEdit }" />
            </b-button>
            <b-button
              class="DocumentListItem-delete"
              href=""
              variant="link"
              :data-cy="`DocumentListItem-delete--${document._id}`"
              :disabled="!canDelete"
              :title="canDelete ? 'Delete Document' : 'You are not allowed to delete this Document'"
              @click.prevent="deleteDocument"
            >
              <i class="fa fa-trash" :class="{ disabled: !canEdit }" />
            </b-button>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-collapse
          :id="`collapse-${document._id}`"
          v-model="expanded"
          class="ml-3 DocumentListItem-content w-100"
        >
          <pre v-json-formatter="{ content: formattedDocument, open: true }" />
        </b-collapse>
      </b-row>
    </b-container>
  </b-list-group-item>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import { mapGetters } from 'vuex';

import JsonFormatter from '@/directives/json-formatter.directive';
import { getBadgeVariant, getBadgeText } from '@/services/documentNotifications';
import { dateFromTimestamp } from '@/utils';

export default {
  name: 'DocumentListItem',
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
      checked: false,
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
    ...mapGetters('auth', ['canEditDocument', 'canDeleteDocument']),
    notifBadgeVariant() {
      if (!get(this.notification, 'action')) {
        return '';
      }
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
  beforeUpdate() {},
  updated() {},
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

<style lang="scss" scoped>
pre {
  font-size: 16px;
}

// .DocumentListView-item {
//   transition: background-color 1.2s ease;

//   &.updated,
//   &.replaced {
//     transition: background-color 0.1s ease;
//     background-color: rgb(255, 238, 161);
//   }

//   &.deleted {
//     transition: background-color 0.1s ease;
//     background-color: rgb(251, 119, 148);
//   }
//   &.created {
//     transition: background-color 0.1s ease;
//     background-color: rgb(153, 230, 123);
//   }
// }
</style>
