<template>
  <div class="DocumentBoxItem card">
    <div class="card-content">
      <div class="DocumentBoxItem-title">
        <span class="card-title">{{document.id}}</span>
        <dropdown
          class="DocumentBoxItem-actions"
          :id="`document-dropdown-${document.id}`"
          >
          <li>
            <a
              v-bind:class="{'disabled': !canEdit}"
              v-title="{active: !canDelete, title: 'You are not allowed to edit this document'}"
              @click="editDocument"
              >
              Edit
            </a>
          </li>
          <li class="divider"></li>
          <li>
            <a
              v-bind:class="{'disabled': !canDelete}"
              v-title="{active: !canDelete, title: 'You are not allowed to delete this document'}"
              @click="deleteDocument"
              >
              Delete
            </a>
          </li>
        </dropdown>
      </div>
      <p
        class="DocumentBoxItem-content"
        v-json-format="{content: documentContent, open: true}">
      </p>
    </div>

  </div>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
import JsonFormat from '../../../directives/json-formatter.directive'
import Title from '../../../directives/title.directive'
import {
  canEditDocument,
  canDeleteDocument
} from '../../../services/userAuthorization'

export default {
  name: 'DocumentBoxItem',
  props: {
    document: Object,
    index: String,
    collection: String
  },
  directives: {
    JsonFormat,
    Title
  },
  components: {
    Dropdown
  },
  data() {
    return {}
  },
  methods: {
    deleteDocument() {
      if (this.canDelete) {
        this.$emit('delete', this.document.id)
      }
    },
    editDocument() {
      if (this.canEdit) {
        this.$emit('edit', this.document.id)
      }
    }
  },
  computed: {
    documentContent() {
      let content = Object.assign(this.document.content, {})
      delete content._kuzzle_info
      return content
    },
    canEdit() {
      if (!this.index || !this.collection) {
        return false
      }
      return canEditDocument(this.index, this.collection)
    },
    canDelete() {
      if (!this.index || !this.collection) {
        return false
      }
      return canDeleteDocument(this.index, this.collection)
    },
    checkboxId() {
      return `checkbox-${this.document.id}`
    }
  }
}
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
