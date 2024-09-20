<template>
  <div class="DocumentBoxItem card">
    <div class="card-content">
      <div class="DocumentBoxItem-title">
        <span class="card-title">{{ document.id }}</span>
        <dropdown :id="`document-dropdown-${document.id}`" class="DocumentBoxItem-actions">
          <li>
            <a :disabled="!canEdit" :class="{ disabled: !canEdit }" @click="editDocument"> Edit </a>
          </li>
          <li class="divider" />
          <li>
            <a :disabled="!canDelete" :class="{ disabled: !canDelete }" @click="deleteDocument">
              Delete
            </a>
          </li>
        </dropdown>
      </div>
      <p v-json-format="{ content: documentContent, open: true }" class="DocumentBoxItem-content" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Dropdown from '@/components/Materialize/Dropdown';
import JsonFormat from '@/directives/json-formatter.directive';

export default {
  name: 'DocumentBoxItem',
  directives: {
    JsonFormat,
  },
  components: {
    Dropdown,
  },
  props: {
    document: Object,
    index: String,
    collection: String,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('auth', ['canEditDocument', 'canDeleteDocument']),
    documentContent() {
      const content = Object.assign(this.document.content, {});
      delete content._kuzzle_info;
      return content;
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
      return `checkbox-${this.document.id}`;
    },
  },
  methods: {
    deleteDocument() {
      if (this.canDelete) {
        this.$emit('delete', this.document.id);
      }
    },
    editDocument() {
      if (this.canEdit) {
        this.$emit('edit', this.document.id);
      }
    },
  },
};
</script>

<style lang="scss">
.DocumentBoxItem {
  min-width: 250px;
  max-width: 350px;
  margin: 0 25px 25px 0;

  .DocumentBoxItem-title {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;

    .card-title {
      flex-grow: 1;
    }

    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .DocumentBoxItem-actions {
    cursor: pointer;
  }

  .DocumentBoxItem-content {
    overflow: hidden;
  }
}
</style>
