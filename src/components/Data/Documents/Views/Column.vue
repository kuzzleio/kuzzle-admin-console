<template>
  <div class="Column" data-cy="DocumentList-Column">
    <div class="d-flex flex-row">
      <div class="flex-grow-1">
        <b-dropdown
          class="mr-2"
          data-cy="SelectField"
          variant="outline-secondary"
          menu-class="dropdownScroll"
          text="Fields"
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
          data-cy="Column-btnExportCSV"
          title="Export currently visible data to CSV"
          @click.prevent="promptExportCSV"
        >
          <i class="fas fa-file-export left" />
          CSV
        </b-button>
      </div>

      <div v-if="hasNewDocuments">
        <b-button
          class="mr-2"
          data-cy="ColumnView-newDocsBadge"
          pill
          variant="info"
          title="The number of document in the collection has changed. Click to refresh."
          @click="$emit('refresh')"
          ><i class="fas fa-file-alt"></i
        ></b-button>
      </div>
      <PerPageSelector
        :current-page-size="currentPageSize"
        :total-documents="totalDocuments"
        @change-page-size="$emit('change-page-size', $event)"
      />
    </div>
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
                :data-cy="`ColumnItem-${item._id}-${field.key}`"
                :key="`item-col-${field.key}`"
                :id="`col-${item._id}-${field.key}`"
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
                    <b-badge
                      v-if="getItemBadge(item)"
                      :variant="getItemBadge(item).variant"
                      class="mx-2"
                      >{{ getItemBadge(item).label }}
                    </b-badge>
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
            <b-tr v-for="item of formattedItems" :key="`item-row-${item._id}`">
              <table-cell
                v-for="field of selectedFields"
                :auto-sync="autoSync"
                :data="item[field]"
                :field-name="field"
                :field-type="flatMapping[field]"
                :key="`item-col-${field}`"
                :rowId="item._id"
              />
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import JsonFormatter from '../../../../directives/json-formatter.directive'
import { getBadgeVariant, getBadgeText } from '@/services/documentNotifications'

import get from 'lodash/get'
import defaultsDeep from 'lodash/defaultsDeep'
import { truncateName } from '@/utils'
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import HeaderTableView from '../HeaderTableView'
import TableCell from './TableCell.vue'
import PerPageSelector from '@/components/Common/PerPageSelector'
import { convertToCSV, flattenObjectMapping } from '@/services/collectionHelper'

export default {
  name: 'Column',
  directives: {
    JsonFormatter
  },
  components: {
    draggable,
    HeaderTableView,
    PerPageSelector,
    TableCell
  },
  props: {
    autoSync: Boolean,
    allChecked: Boolean,
    currentPageSize: Number,
    collectionSettings: Object,
    totalDocuments: Number,
    documents: Array,
    index: String,
    collection: String,
    mapping: Object,
    selectedDocuments: Array,
    notifications: Object,
    hasNewDocuments: Boolean
  },
  data() {
    return {
      itemsPerPage: [10, 25, 50, 100, 500],
      selectedFields: [],
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
          const value = get(d._source, key)
          doc[key] = value
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
    },
    flatMapping() {
      if (!this.mapping) {
        return {}
      }

      return flattenObjectMapping(this.mapping)
    },
    fieldList() {
      return Object.keys(this.flatMapping)
    }
  },
  methods: {
    getItemBadge(item) {
      const n = this.notifications[item._id]
      if (!n) {
        return null
      }
      return {
        label: getBadgeText(n.action),
        variant: getBadgeVariant(n.action)
      }
    },
    promptExportCSV() {
      this.$bvModal
        .msgBoxConfirm(
          'Please, be aware that the documents that will be exported, are ONLY the ones that are currently displayed and NOT the whole collection.',
          {
            title: 'Please Confirm',
            okVariant: 'primary',
            okTitle: 'Export displayed documents',
            cancelTitle: 'Cancel',
            footerClass: 'p-2',
            hideHeaderClose: false,
            centered: true
          }
        )
        .then(value => {
          if (value) {
            this.exportToCSV()
          }
        })
    },
    exportToCSV() {
      const blob = new Blob([
        convertToCSV(this.formattedItems, this.selectedFields)
      ])
      const a = document.createElement('a')
      a.download = `${this.index}-${this.collection}.csv`
      a.href = URL.createObjectURL(blob)
      a.addEventListener('click', () => {
        setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000)
      })
      a.click()
    },
    resetColumns() {
      this.selectedFields = []
    },
    truncateName,
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
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
      this.selectedFields = get(
        this.collectionSettings,
        'columnView.fields',
        []
      )
    },
    toggleColumn(field, value) {
      this.$log.debug(`Toggling field ${field}`)
      if (value && !this.selectedFields.includes(field)) {
        this.selectedFields.push(field)
      }
      if (!value) {
        this.$delete(this.selectedFields, this.selectedFields.indexOf(field))
      }
    },
    toggleJsonFormatter(id) {
      if (this.$refs[id][0].style.visibility === 'hidden') {
        this.$refs[id][0].style.visibility = 'visible'
      } else {
        this.$refs[id][0].style.visibility = 'hidden'
      }
    },
    getNestedField(doc, customField) {
      return get(doc, customField, null)
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
    // buildFieldList(mapping, path = []) {
    //   let attributes = []

    //   for (const [attributeName, attributeValue] of Object.entries(mapping)) {
    //     if (
    //       Object.prototype.hasOwnProperty.call(attributeValue, 'properties')
    //     ) {
    //       attributes = attributes.concat(
    //         this.buildFieldList(
    //           attributeValue.properties,
    //           path.concat(attributeName)
    //         )
    //       )
    //     } else if (
    //       Object.prototype.hasOwnProperty.call(attributeValue, 'type')
    //     ) {
    //       attributes = attributes.concat(path.concat(attributeName).join('.'))
    //     }
    //   }
    //   return attributes
    // },
    initFields() {
      this.initSelectedFields()
      // this.fieldList = this.buildFieldList(this.mapping)
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
    },
    selectedFields(value) {
      this.$emit(
        'settings-updated',
        defaultsDeep({ columnView: { fields: value } }, this.collectionSettings)
      )
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
