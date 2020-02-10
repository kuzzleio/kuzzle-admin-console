<template>
  <b-container fluid class="DocumentListItem">
    <b-row align-h="between" no-gutters>
      <b-col cols="10" class="py-1 DocumentListItem-nameActions">
        <i
          @click="toggleCollapse"
          :class="
            `fa fa-caret-${
              expanded ? 'down mr-1' : 'right mr-2 '
            } d-inline-block align-middle DocumentListItem-caret`
          "
          aria-hidden="true"
        />
        <b-form-checkbox
          class="d-inline-block align-middle"
          :id="checkboxId"
          type="checkbox"
          value="true"
          unchecked-value="false"
          v-model="checked"
          @change="notifyCheckboxClick"
        />
        <a
          class="d-inline-block align-middle code pointer"
          @click="toggleCollapse"
          >{{ document.id }}</a
        >
      </b-col>
      <b-col cols="2">
        <div class="float-right">
          <b-button
            class="DocumentListItem-update"
            href=""
            variant="link"
            :disabled="!canEdit"
            :title="
              canEdit
                ? 'Edit Document'
                : 'You are not allowed to edit this Document'
            "
            @click.prevent="editDocument"
          >
            <i class="fa fa-pencil-alt" :class="{ disabled: !canEdit }" />
          </b-button>
          <b-button
            class="DocumentListItem-delete"
            href=""
            variant="link"
            :data-cy="`DocumentListItem-delete--${document.id}`"
            :disabled="!canDelete"
            :title="
              canDelete
                ? 'Delete Document'
                : 'You are not allowed to delete this Document'
            "
            @click.prevent="deleteDocument"
          >
            <i class="fa fa-trash" :class="{ disabled: !canEdit }" />
          </b-button>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-collapse
        :id="`collapse-${document.id}`"
        v-model="expanded"
        class="mt-3 ml-3 DocumentListItem-content"
      >
        <pre v-json-formatter="{ content: document.content, open: true }" />
        <pre v-json-formatter="{ content: document.meta, open: false }" />
        <pre
          v-if="document.aggregations"
          v-json-formatter="{ content: document.aggregations, open: true }"
        />
      </b-collapse>
    </b-row>
  </b-container>
</template>

<script>
import JsonFormatter from '../../../directives/json-formatter.directive'
import {
  canEditDocument,
  canDeleteDocument
} from '../../../services/userAuthorization'
import title from '../../../directives/title.directive'

export default {
  name: 'DocumentListItem',
  directives: {
    JsonFormatter,
    title
  },
  props: {
    index: String,
    collection: String,
    document: Object,
    isChecked: Boolean
  },
  data() {
    return {
      expanded: false,
      checked: false
    }
  },
  watch: {
    isChecked: {
      handler(value) {
        this.checked = value
      }
    }
  },
  computed: {
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
  },
  mounted() {
    const date = new Date(this.document.meta.createdAt)
    this.document.meta.createdAt += ` (${date.toUTCString()})`
  },
  methods: {
    toggleCollapse() {
      this.expanded = !this.expanded
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document.id)
    },
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
  }
}
</script>

<style type="scss" rel="stylesheet/scss" scoped>
.DocumentListItem-nameActions {
  overflow: hidden;
  white-space: nowrap;
}
.DocumentListItem-caret {
  cursor: pointer;
}
pre {
  font-size: 16px;
}
</style>
