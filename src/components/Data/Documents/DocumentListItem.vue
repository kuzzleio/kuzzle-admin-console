<template>
  <b-container fluid>
    <b-row align-h="between" no-gutters>
      <b-col cols="10">
        <b-row no-gutters class="pt-1">
          <i
            @click="toggleCollapse"
            :class="`fa fa-caret-${expanded ? 'down' : 'right'} mr-2 mt-1`"
            aria-hidden="true"
          />
          <b-form-checkbox
            class="align-middle"
            :id="checkboxId"
            type="checkbox"
            value="true"
            unchecked-value="false"
            v-model="checked"
            @change="notifyCheckboxClick"
          />
          <a class="align-middle" @click="toggleCollapse">{{ document.id }}</a>
        </b-row>
      </b-col>
      <b-col cols="2">
        <div class="float-right">
          <a
            class="DocumentListItem-update"
            href=""
            :title="
              canEdit
                ? 'Edit Document'
                : 'You are not allowed to edit this Document'
            "
            @click.prevent="editDocument"
          >
            <i class="fa fa-pencil-alt" :class="{ disabled: !canEdit }" />
          </a>

          <b-dropdown
            :id="document.id"
            toggle-class="text-decoration-none"
            no-caret
            variant="link"
            size="sm"
          >
            <template v-slot:button-content>
              <i class="fas fa-ellipsis-v" />
            </template>
            <!-- myclass="DocumentListItem-dropdown icon-black" -->
            <b-dropdown-item
              :disabled="!canDelete"
              :class="{ disabled: !canDelete }"
              @click="deleteDocument"
            >
              Delete
            </b-dropdown-item>
          </b-dropdown>
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
        console.log('setChecked')
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
pre {
  font-size: larger;
}
</style>
