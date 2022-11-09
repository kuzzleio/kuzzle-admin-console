<template>
  <div class="Column" data-cy="DocumentList-Column">
    <div class="d-flex flex-row align-items-center">
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
            <span class="inlineDisplay-item"> No searchable field </span>
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

        <b-button @click="exportToCSV"
          ><i class="fas fa-file-export left" /> CSV</b-button
        >
      </div>

      <PerPageSelector
        :current-page-size="currentPageSize"
        :total-documents="totalDocuments"
        @change-page-size="$emit('change-page-size', $event)"
      />
      <new-documents-badge
        :has-new-documents="hasNewDocuments"
        @refresh="$emit('refresh')"
      />
    </div>
    <b-row class="mt-2 mb-2" no-gutters>
      <b-col cols="3">
        <b-table-simple responsive bordered data-cy="ColumnView-table-id">
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
            <highlightable-row
              v-for="item of formattedItems"
              :key="`item-row-${item._id}`"
              :auto-sync="autoSync"
              :notification="notifications[item._id]"
            >
              <!-- <b-tr v-for="item of formattedItems" :key="`item-row-${item._id}`"> -->
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
                      v-if="
                        getItemBadge(item) &&
                        !autoSync &&
                        getItemBadge(item).label !== 'created'
                      "
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
            </highlightable-row>
          </b-tbody>
        </b-table-simple>
      </b-col>
      <b-col cols="9">
        <b-table-simple responsive bordered data-cy="ColumnView-table-data">
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
            <highlightable-row
              v-for="item of formattedItems"
              :key="`item-row-${item._id}`"
              :auto-sync="autoSync"
              :notification="notifications[item._id]"
            >
              <table-cell
                v-for="field of selectedFields"
                :key="`item-col-${field}`"
                :auto-sync="autoSync"
                :data="item[field]"
                :field-name="field"
                :field-type="flatMapping[field]"
                :rowId="item._id"
              />
            </highlightable-row>
          </b-tbody>
        </b-table-simple>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import JsonFormatter from '../../../../../directives/json-formatter.directive'
import { getBadgeVariant, getBadgeText } from '@/services/documentNotifications'

import get from 'lodash/get'
import defaultsDeep from 'lodash/defaultsDeep'
import { truncateName } from '@/utils'
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import HeaderTableView from './HeaderTableView'
import TableCell from './TableCell.vue'
import HighlightableRow from './HighlightableRow.vue'
import PerPageSelector from '@/components/Common/PerPageSelector'
import NewDocumentsBadge from '../../Common/NewDocumentsBadge.vue'

import { flattenObjectMapping } from '@/services/collectionHelper'

export default {
  name: 'Column',
  directives: {
    JsonFormatter,
  },
  components: {
    draggable,
    HeaderTableView,
    PerPageSelector,
    TableCell,
    HighlightableRow,
    NewDocumentsBadge,
  },
  props: {
    searchQuery: Object,
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
    hasNewDocuments: Boolean,
  },
  data() {
    return {
      itemsPerPage: [10, 25, 50, 100, 500],
      selectedFields: [],
      tableDefaultHeaders: [
        {
          key: 'acColumnTableActions',
          label: '',
        },
        {
          key: 'acColumnTableId',
          label: 'Id',
        },
      ],
      displayDragIcon: false,
      tabResizing: null,
      startOffset: null,
    }
  },
  computed: {
    ...mapGetters('auth', ['canEditDocument', 'canDeleteDocument', 'user']),
    ...mapGetters('kuzzle', ['wrapper', 'currentEnvironment']),
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
      return this.fieldList.map((field) => ({
        text: field,
        displayed: this.selectedFields.includes(field),
      }))
    },
    formattedItems() {
      return this.documents.map((d) => {
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
    },
  },
  methods: {
    getItemBadge(item) {
      const n = this.notifications[item._id]
      if (!n) {
        return null
      }
      return {
        label: getBadgeText(n.action),
        variant: getBadgeVariant(n.action),
      }
    },

    exportToCSV() {
      const base = this.currentEnvironment.ssl ? 'https://' : 'http://'
      const urlBase = `${base}${this.currentEnvironment.host}:${this.currentEnvironment.port}`
      // Request to the export api endopoint
      let request = new XMLHttpRequest()
      request.open(
        'POST',
        `${urlBase}/${this.index}/${this.collection}/_export?format=csv`
      )
      request.setRequestHeader('Content-Type', 'application/json')
      request.responseType = 'text'

      // Request body with the selected fields and the current query
      const body = JSON.stringify({
        query: this.searchQuery,
        fields: this.selectedFields,
      })

      // Send the request
      request.send(body)

      const filename = `${this.index}-${this.collection}-export.csv`
      // When the request is done, download the file
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          const blob = new Blob([request.response])
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = filename
          link.click()
        }
      }
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
    initFields() {
      this.initSelectedFields()
    },
  },
  created() {
    this.csvExportPromptModalID = 'export-csv-prompt'
  },
  mounted() {
    this.initFields()
  },
  watch: {
    $route: {
      immediate: false,
      handler() {
        this.initFields()
      },
    },
    mapping: {
      immediate: false,
      handler() {
        this.initFields()
      },
    },
    selectedFields(value) {
      this.$emit(
        'settings-updated',
        defaultsDeep({ columnView: { fields: value } }, this.collectionSettings)
      )
    },
  },
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
  height: 65px;
  vertical-align: middle !important;
  white-space: nowrap;
}
</style>
