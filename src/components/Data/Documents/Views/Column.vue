<template>
  <div class="Column" data-cy="DocumentList-Column">
    <b-row no-gutters>
      <b-col cols="8">
        <b-dropdown
          class="mr-2"
          data-cy="SelectField"
          variant="outline-secondary"
          menu-class="dropdownScroll"
          text="Select columns to display"
          no-flip
        >
          <b-dropdown-item-button
            v-if="selectedFields.length !== 0"
            class="pl-4"
            @click="resetColumns"
          >
            Unselect all
          </b-dropdown-item-button>
          <b-dropdown-text
            class="dropdown-text inlineDisplay pointer p-0"
            v-for="field of dropdownFields"
            :key="`dropdown-${field.text}`"
          >
            <span class="inlineDisplay-item">
              <b-form-checkbox
                class="mx-2"
                :checked="field.displayed"
                :data-cy="`SelectField--${field.text}`"
                :id="field.text"
                @change="toggleColumn(field.text, $event)"
              />
            </span>
            <label
              class="inlineDisplay-item code pointer"
              :for="field.text"
              :title="field.text"
              >{{ field.text }}</label
            >
          </b-dropdown-text>
          <b-dropdown-item v-if="dropdownFields.length === 0">
            <span class="inlineDisplay-item">
              No searchable field
            </span>
          </b-dropdown-item>
        </b-dropdown>
        <b-button
          variant="outline-dark"
          class="mr-2"
          @click="$emit('toggle-all')"
        >
          <i
            :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'} left`"
          />
          Toggle all
        </b-button>

        <b-button
          variant="outline-danger"
          class="mr-2"
          :disabled="!bulkDeleteEnabled"
          @click="$emit('bulk-delete')"
        >
          <i class="fa fa-minus-circle left" />
          Delete
        </b-button>

        <b-button
          variant="outline-secondary"
          class="mr-2"
          @click.prevent="$emit('refresh')"
        >
          <i class="fas fa-sync-alt left" />
          Refresh
        </b-button>
      </b-col>

      <b-col cols="4" class="text-right">
        <PerPageSelector
          :current-page-size="currentPageSize"
          :total-documents="totalDocuments"
          @change-page-size="$emit('change-page-size', $event)"
        />
      </b-col>
    </b-row>
    <b-row no-gutters class="mt-3 mb-2">
      <b-col cols="12">
        <b-alert :show="true" dismissible fade variant="info" class="m-0">
          <i class="fas fa-info-circle mr-2"></i> This view does not allow you
          to see array values.
        </b-alert>
      </b-col>
    </b-row>
    <b-row class="mt-2 mb-2" no-gutters>
      <b-col cols="3">
        <b-table-simple
          responsive
          striped
          hover
          bordered
          data-cy="ColumnView-table-id"
        >
          <b-thead>
            <b-tr>
              <b-th
                v-for="field of tableDefaultHeaders"
                :key="`header-col-${field.key}`"
                :id="`header-col-${field}`"
              >
                {{ field.label }}
              </b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="item of formattedItems" :key="`item-row-${item._id}`">
              <b-td
                class="cell"
                colspan="1"
                v-for="field of tableDefaultHeaders"
                :key="`item-col-${field.key}`"
                :id="`col-${item._id}-${field}`"
              >
                <template v-if="field.key === 'acColumnTableActions'">
                  <div class="inlineDisplay">
                    <span class="inlineDisplay-item">
                      <b-form-checkbox
                        :checked="isChecked(item._id)"
                        :data-cy="`ColumnView-table-select-btn--${item._id}`"
                        @change="toggleSelectDocument(item._id)"
                      />
                    </span>
                    <span class="inlineDisplay-item">
                      <b-button
                        title="Edit document"
                        variant="link"
                        class="px-0 mx-1"
                        :data-cy="`ColumnView-table-edit-btn--${item._id}`"
                        :disabled="!canEdit"
                        @click="editDocument(item._id)"
                      >
                        <i class="fa fa-pen" />
                      </b-button>
                    </span>
                    <span class="inlineDisplay-item">
                      <b-button
                        class="px-0 mx-1"
                        title="Delete document"
                        variant="link"
                        :data-cy="`ColumnView-table-delete-btn--${item._id}`"
                        :disabled="!canDelete"
                        @click="deleteDocument(item._id)"
                      >
                        <i class="fa fa-trash" />
                      </b-button>
                    </span>
                  </div>
                </template>
                <template v-else-if="field.key === 'acColumnTableId'">
                  {{ item._id }}
                </template>
              </b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </b-col>
      <b-col cols="9">
        <b-table-simple
          responsive
          striped
          hover
          bordered
          data-cy="ColumnView-table-data"
        >
          <b-thead>
            <draggable
              v-model="selectedFields"
              tag="tr"
              handle=".handle"
              filter=".ignore"
              draggable=".draggableItem"
            >
              <HeaderTableView
                v-for="field of selectedFields"
                :key="`header-col-${field}`"
                :field="field"
                :displayDragIcon="displayDragIcon"
                @mouseenter="displayDragIcon = true"
                @mouseleave="displayDragIcon = false"
              />
            </draggable>
          </b-thead>
          <b-tbody>
            <b-tr v-for="item of formattedItems" :key="`item-row-${item.id}`">
              <b-td
                class="cell"
                v-for="field of selectedFields"
                :key="`item-col-${field}`"
                :id="`col-${item._id}-${field}`"
              >
                {{ item[field] }}
              </b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import JsonFormatter from '../../../../directives/json-formatter.directive'
import _ from 'lodash'
import { truncateName } from '@/utils'
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import HeaderTableView from '../HeaderTableView'
import PerPageSelector from "@/components/Common/PerPageSelector"

export default {
  name: 'Column',
  directives: {
    JsonFormatter
  },
  components: {
    draggable,
    HeaderTableView,
    PerPageSelector
  },
  props: {
    allChecked: Boolean,
    currentPageSize: Number,
    totalDocuments: Number,
    documents: Array,
    index: String,
    collection: String,
    mapping: Object,
    selectedDocuments: Array
  },
  data() {
    return {
      itemsPerPage: [10, 25, 50, 100, 500],
      selectedFields: [],
      fieldList: [],
      tableDefaultHeaders: [
        {
          key: 'acColumnTableActions',
          label: ''
        },
        {
          key: 'acColumnTableId',
          label: 'Id'
        }
      ],
      tableItems: [],
      displayDragIcon: false,
      tabResizing: null,
      startOffset: null
    }
  },
  computed: {
    ...mapGetters('auth', ['canEditDocument', 'canDeleteDocument']),
    hasSelectedDocuments() {
      return this.selectedDocuments.length > 0
    },
    bulkDeleteEnabled() {
      return (
        this.canDeleteDocument(this.index, this.collection) &&
        this.hasSelectedDocuments
      )
    },
    dropdownFields() {
      return this.fieldList.map(field => ({
        text: field,
        displayed: this.selectedFields.includes(field)
      }))
    },
    formattedItems() {
      return this.documents.map(d => {
        const doc = {}
        doc._id = d._id
        for (const key of this.selectedFields) {
          // if there is an array in the current document within the 'path'
          if (this.documentPathContainsArray(key, d)) {
            doc[key] = { array: true }
          } else {
            const parsed = this.parseDocument(key, d)
            if (parsed.value === undefined) {
              doc[key] = { undefined: true }
            } else if (parsed.value === null) {
              doc[key] = { null: true }
            } else {
              doc[key] = parsed.value
            }
          }
        }
        return doc
      })
    },
    canEdit() {
      if (!this.index || !this.collection) {
        return false
      }
      return this.canEditDocument(this.index, this.collection)
    },
    canDelete() {
      if (!this.index || !this.collection) {
        return false
      }
      return this.canDeleteDocument(this.index, this.collection)
    },
    checkboxId() {
      return `checkbox-${this.document._id}`
    }
  },
  methods: {
    resetColumns() {
      this.selectedFields = []
      this.saveSelectedFieldsToLocalStorage()
    },
    truncateName,
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    },
    documentPathContainsArray(path, document) {
      let containsArray = false,
        str = ''
      for (const key of path.split('.')) {
        str += key
        if (Array.isArray(this.parseDocument(str, document).realValue)) {
          containsArray = true
        }
        str += '.'
      }
      return containsArray
    },
    getLastKeyPath(label) {
      const splittedLabel = label.split('.')
      return `${splittedLabel.length > 1 ? '...' : ''}${
        splittedLabel[splittedLabel.length - 1]
      }`
    },
    toggleSelectDocument(id) {
      this.$emit('checkbox-click', id)
    },
    initSelectedFields() {
      const columnViewConfig = JSON.parse(
        localStorage.getItem('columnViewConfig') || '{}'
      )
      if (
        columnViewConfig[this.index] &&
        columnViewConfig[this.index][this.collection]
      ) {
        this.selectedFields = columnViewConfig[this.index][this.collection]
      }
    },
    toggleColumn(field, value) {
      this.$log.debug(`Toggling field ${field}`)
      if (value && !this.selectedFields.includes(field)) {
        this.selectedFields.push(field)
      }
      if (!value) {
        this.$delete(this.selectedFields, this.selectedFields.indexOf(field))
      }
      this.saveSelectedFieldsToLocalStorage()
    },
    toggleJsonFormatter(id) {
      if (this.$refs[id][0].style.visibility === 'hidden') {
        this.$refs[id][0].style.visibility = 'visible'
      } else {
        this.$refs[id][0].style.visibility = 'hidden'
      }
    },
    parseDocument(attr, doc) {
      const ret = attr.includes('.')
        ? this.getNestedField(doc, attr)
        : doc[attr]

      if (typeof ret === 'object' && ret !== null) {
        return {
          isObject: true,
          value: JSON.stringify(ret).substring(0, 10),
          realValue: ret
        }
      }

      return {
        isObject: false,
        value: ret
      }
    },
    saveSelectedFieldsToLocalStorage() {
      if (this.index && this.collection) {
        const config = JSON.parse(
          localStorage.getItem('columnViewConfig') || '{}'
        )
        if (!config[this.index]) {
          config[this.index] = {}
        }
        config[this.index][this.collection] = this.selectedFields
        localStorage.setItem('columnViewConfig', JSON.stringify(config))
      }
    },
    getNestedField(doc, customField) {
      return _.get(doc, customField, null)
    },
    deleteDocument(id) {
      if (this.canDelete) {
        this.$emit('delete', id)
      }
    },
    editDocument(id) {
      if (this.canEdit) {
        this.$emit('edit', id)
      }
    },
    buildFieldList(mapping, path = []) {
      let attributes = []

      for (const [attributeName, attributeValue] of Object.entries(mapping)) {
        if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'properties')
        ) {
          attributes = attributes.concat(
            this.buildFieldList(
              attributeValue.properties,
              path.concat(attributeName)
            )
          )
        } else if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'type')
        ) {
          attributes = attributes.concat(path.concat(attributeName).join('.'))
        }
      }
      return attributes
    },
    initFields() {
      this.initSelectedFields()
      this.fieldList = this.buildFieldList(this.mapping)
    }
  },
  mounted() {
    this.initFields()
  },
  watch: {
    $route: {
      immediate: false,
      handler() {
        this.initFields()
      }
    },
    mapping: {
      immediate: false,
      handler() {
        this.initFields()
      }
    }
  }
}
</script>

<style lang="scss">
.inlineDisplay {
  display: table;

  &-item {
    display: table-cell;
  }
}

.dropdownScroll {
  max-height: 250px;
  overflow-y: scroll;
}

.columnClass {
  min-width: 100px;
  overflow: hidden;
}

.valueDisplayer {
  white-space: nowrap;
  display: inline-block;
}

.dropdown-text {
  display: block;
  width: 100%;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
}

.cell {
  height: 70px;
  white-space: nowrap;
}
</style>
