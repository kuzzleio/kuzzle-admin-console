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
              @click="editDocument"
              >
              Edit
            </a>
          </li>
          <li class="divider"></li>
          <li>
            <a
              v-bind:class="{'disabled': !canDelete}"
              @click="deleteDocument"
              >
              Delete
            </a>
          </li>
        </dropdown>
      </div>
      <p v-for="(value, key) in documentContent" :key="value"><strong>{{key}}</strong>: {{value}}</p>
    </div>

  </div>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
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
  directives: {},
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

<style type="scss" rel="stylesheet/scss" scoped>
.DocumentBoxItem {
  min-width: 250px;
  max-width: 350px;
  margin: 0 25px 25px 0;
}

.DocumentBoxItem-title {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.DocumentBoxItem-title span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.DocumentBoxItem-actions {
  cursor: pointer;
}
</style>
