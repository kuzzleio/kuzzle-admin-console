<template>
  <div
    class="DocumentListItem"
    :class="{ 'collapsed': collapsed }"
  >
    <i
      class="DocumentListItem-toggle fa fa-caret-down item-toggle"
      aria-hidden="true"
      @click="toggleCollapse()"
    />

    <label>
      <input
        :id="checkboxId"
        type="checkbox"
        class="filled-in"
        :value="document.id"
        :checked="isChecked"
        @click="notifyCheckboxClick"
      >
      <span />
    </label>

    <label class="DocumentListItem-title item-title "><a @click="toggleCollapse">{{ document.id }}</a></label>

    <div class="DocumentListItem-actions right">
      <a
        class="DocumentListItem-update"
        href=""
        :title="canEdit ? 'Edit Document' : 'You are not allowed to edit this Document'"
        @click.prevent="editDocument"
      >
        <i
          class="fa fa-pencil-alt"
          :class="{'disabled': !canEdit}"
        />
      </a>

      <dropdown
        :id="document.id"
        myclass="DocumentListItem-dropdown icon-black"
      >
        <li>
          <a
            :disabled="!canDelete"
            :class="{disabled: !canDelete}"
            @click="deleteDocument"
          >
            Delete
          </a>
        </li>
      </dropdown>
    </div>

    <div class="DocumentListItem-content item-content">
      <pre v-json-formatter="{content: document.content, open: true}" />
      <pre v-json-formatter="{content: document.meta, open: false}" />
      <pre
        v-if="document.aggregations"
        v-json-formatter="{content: document.aggregations, open: true}"
      />
    </div>
  </div>
</template>

<script>
import JsonFormatter from '../../../directives/json-formatter.directive'
import Dropdown from '../../Materialize/Dropdown'
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
  components: {
    Dropdown
  },
  props: {
    index: String,
    collection: String,
    document: Object,
    isChecked: Boolean
  },
  data() {
    return {
      collapsed: true
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
      this.collapsed = !this.collapsed
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
.DocumentListItem-toggle {
  padding: 0 10px;
  margin-left: -10px;
  cursor: pointer;
  transition-duration: 0.2s;
}

.collapsed .DocumentListItem-toggle {
  transform: rotate(-90deg);
}

.DocumentListItem-title {
  color: black;
  line-height: 21px;
  cursor: pointer;
  font-size: 1rem;
  font-family: 'AnonymousPro';
}

.DocumentListItem-content {
  transition-duration: 0.2s;
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px 10px 0 0;

  pre {
    margin: 0;
    width: 70%;
    display: inline-block;
  }
}

.collapsed .DocumentListItem-content {
  max-height: 0;
  transition-duration: 0;
  padding: 0 10px 0 0;
}

.DocumentListItem-actions {
  margin-top: 1px;
  font-size: 1em;
}

/* HACK for centring the checkbox between the caret and the title */
[type='checkbox'] + span:not(.lever) {
  height: 15px;
  padding-left: 30px;
}
</style>
