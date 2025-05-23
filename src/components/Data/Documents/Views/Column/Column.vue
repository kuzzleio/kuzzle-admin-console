<template>
  <div class="Column" data-cy="DocumentList-Column">
    <div class="d-flex flex-row align-items-center">
      <div class="flex-grow-1 d-flex align-items-stretch">
        <div class="d-inline-block mr-2 w-full max-w-24rem">
          <multiselect
            v-model="selectedFieldsComputed"
            :options="dropdownFields.map((field) => field.text)"
            :taggable="true"
            tag-placeholder="Add custom field"
            placeholder="Select fields"
            :multiple="true"
            :close-on-select="false"
            :allow-empty="true"
            @tag="addCustomField"
          />
        </div>
        <b-button
          variant="outline-dark"
          class="mr-2 align-self-center"
          @click="$emit('toggle-all')"
        >
          <i :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'} left`" />
          Toggle all
        </b-button>
        <b-button variant="outline-secondary" class="mr-2 align-self-center" @click="resetColumns">
          Reset
        </b-button>

        <b-button
          variant="outline-danger"
          class="mr-2 align-self-center"
          :disabled="!bulkDeleteEnabled"
          @click="$emit('bulk-delete')"
        >
          <i class="fa fa-minus-circle left" />
          Delete
        </b-button>

        <b-button
          variant="outline-secondary"
          class="mr-2 align-self-center"
          data-cy="Column-btnExportCSV"
          title="Export columns to CSV"
          @click.prevent="displayModalExportCSV"
        >
          <i class="fas fa-file-export left" />
          CSV
        </b-button>
      </div>

      <PerPageSelector
        :current-page-size="currentPageSize"
        :total-documents="totalDocuments"
        @change-page-size="$emit('change-page-size', $event)"
      />
      <new-documents-badge :has-new-documents="hasNewDocuments" @refresh="$emit('refresh')" />
    </div>
    <b-row class="mt-2 mb-2" no-gutters>
      <b-col cols="3">
        <b-table-simple responsive bordered data-cy="ColumnView-table-id">
          <b-thead>
            <b-tr>
              <b-th
                v-for="field of tableDefaultHeaders"
                :id="`header-col-${field}`"
                :key="`header-col-${field.key}`"
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
                v-for="field of tableDefaultHeaders"
                :id="`col-${item._id}-${field.key}`"
                :key="`item-col-${field.key}`"
                class="cell"
                colspan="1"
                :data-cy="`ColumnItem-${item._id}-${field.key}`"
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
                        getItemBadge(item) && !autoSync && getItemBadge(item).label !== 'created'
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
                :display-drag-icon="displayDragIcon"
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
                :row-id="item._id"
              />
            </highlightable-row>
          </b-tbody>
        </b-table-simple>
      </b-col>
    </b-row>

    <b-modal
      id="export-csv-modal"
      size="lg"
      @shown="fetchSingleUseToken"
      @hide="clearSingleUseToken"
    >
      <p>Click the following link to download your CSV export</p>

      <a
        v-if="singleUseToken"
        class="left p-2 rounded bg-info text-light downloadCSVLink"
        :href="exportUrl"
        target="_blank"
        @click="clearSingleUseToken"
      >
        <i class="fas fa-file-export" />
        Download
      </a>
      <p v-else>Preparing download..</p>
    </b-modal>
  </div>
</template>

<script>
import defaultsDeep from 'lodash/defaultsDeep';
import get from 'lodash/get';
import { mapState } from 'pinia';
import draggable from 'vuedraggable';

import JsonFormatter from '@/directives/json-formatter.directive';
import { flattenObjectMapping } from '@/services/collectionHelper';
import { getBadgeVariant, getBadgeText } from '@/services/documentNotifications';
import { useAuthStore, useKuzzleStore } from '@/stores';
import { truncateName } from '@/utils';

import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NewDocumentsBadge from '@/components/Data/Documents/Common/NewDocumentsBadge.vue';
import HeaderTableView from './HeaderTableView.vue';
import HighlightableRow from './HighlightableRow.vue';
import TableCell from './TableCell.vue';
import Multiselect from 'vue-multiselect';
import {} from 'vue-multiselect/dist/vue-multiselect.min.css';

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
    Multiselect,
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
  setup() {
    return {
      authStore: useAuthStore(),
    };
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
      singleUseToken: null,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canEditDocument', 'canDeleteDocument', 'user']),
    ...mapState(useKuzzleStore, ['wrapper', 'currentEnvironment']),
    exportUrl() {
      const protocol = this.currentEnvironment.ssl ? 'https' : 'http';
      const baseUrl = `${protocol}://${this.currentEnvironment.host}:${this.currentEnvironment.port}`;
      const query = JSON.stringify(this.searchQuery);
      const fields = JSON.stringify(this.selectedFields);

      const exportUrl = `${baseUrl}/${this.index}/${this.collection}/_export?format=csv&query=${query}&fields=${fields}`;

      if (this.singleUseToken) {
        return `${exportUrl}&jwt=${this.singleUseToken}`;
      }

      return exportUrl;
    },
    hasSelectedDocuments() {
      return this.selectedDocuments.length > 0;
    },
    bulkDeleteEnabled() {
      return this.canDeleteDocument(this.index, this.collection) && this.hasSelectedDocuments;
    },
    dropdownFields() {
      return this.fieldList.map((field) => ({
        text: field,
        displayed: this.selectedFields.includes(field),
      }));
    },
    formattedItems() {
      return this.documents.map((d) => {
        const doc = {};
        doc._id = d._id;
        for (const key of this.selectedFields) {
          const value = get(d._source, key);
          doc[key] = value;
        }
        return doc;
      });
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
    flatMapping() {
      if (!this.mapping) {
        return {};
      }

      return flattenObjectMapping(this.mapping);
    },
    fieldList() {
      return Object.keys(this.flatMapping);
    },
    selectedFieldsComputed: {
      get() {
        return this.selectedFields;
      },
      set(value) {
        this.selectedFields.splice(0, this.selectedFields.length, ...value);
      },
    },
  },
  watch: {
    $route: {
      immediate: false,
      handler() {
        this.initFields();
      },
    },
    mapping: {
      immediate: false,
      handler() {
        this.initFields();
      },
    },
    selectedFields(value) {
      this.$emit(
        'settings-updated',
        defaultsDeep({ columnView: { fields: value } }, this.collectionSettings),
      );
    },
  },
  mounted() {
    this.initFields();
  },
  methods: {
    async fetchSingleUseToken() {
      this.singleUseToken = await this.authStore.createSingleUseToken();
    },
    clearSingleUseToken() {
      this.singleUseToken = null;
      this.hideModalExportCSV();
    },
    displayModalExportCSV() {
      this.$bvModal.show('export-csv-modal');
    },
    hideModalExportCSV() {
      this.$bvModal.hide('export-csv-modal');
    },
    getItemBadge(item) {
      const n = this.notifications[item._id];
      if (!n) {
        return null;
      }
      return {
        label: getBadgeText(n.action),
        variant: getBadgeVariant(n.action),
      };
    },
    resetColumns() {
      this.selectedFields.splice(0, this.selectedFields.length);
    },
    truncateName,
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1;
    },
    getLastKeyPath(label) {
      const splittedLabel = label.split('.');
      return `${splittedLabel.length > 1 ? '...' : ''}${splittedLabel[splittedLabel.length - 1]}`;
    },
    toggleSelectDocument(id) {
      this.$emit('checkbox-click', id);
    },
    initSelectedFields() {
      this.selectedFields = get(this.collectionSettings, 'columnView.fields', []);
    },
    addCustomField(newField) {
      const trimmedField = newField.trim();
      if (trimmedField && !this.selectedFields.includes(trimmedField)) {
        this.selectedFields.push(trimmedField);
      }
    },
    toggleJsonFormatter(id) {
      if (this.$refs[id][0].style.visibility === 'hidden') {
        this.$refs[id][0].style.visibility = 'visible';
      } else {
        this.$refs[id][0].style.visibility = 'hidden';
      }
    },
    getNestedField(doc, customField) {
      return get(doc, customField, null);
    },
    deleteDocument(id) {
      if (this.canDelete) {
        this.$emit('delete', id);
      }
    },
    editDocument(id) {
      if (this.canEdit) {
        this.$emit('edit', id);
      }
    },
    initFields() {
      this.initSelectedFields();
    },
  },
};
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

.downloadCSVLink {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', 'Liberation Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol', 'Noto Color Emoji';
}

.multiselect__option--selected.multiselect__option--highlight {
  background: #e64472 !important;
}

.max-w-24rem {
  max-width: 24rem;
}
</style>
