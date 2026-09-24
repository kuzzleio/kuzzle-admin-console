<template>
  <div class="Column" data-cy="DocumentList-Column">
    <div class="flex flex-row items-center gap-2">
      <div class="flex flex-1 items-stretch gap-2">
        <div class="inline-block w-full max-w-96">
          <multiselect
            :value="selectedFieldsComputed"
            :allow-empty="true"
            data-cy="ColumnView-fieldSelector"
            :close-on-select="false"
            :multiple="true"
            :options="dropdownFields.map((field) => field.text)"
            placeholder="Select fields"
            tag-placeholder="Add custom field"
            :taggable="true"
            @input="selectedFieldsComputed = $event"
            @tag="addCustomField"
          >
            <template #option="{ option }">{{ option }}</template>
          </multiselect>
        </div>
        <Button class="self-center" variant="outline" @click="$emit('toggle-all')">
          <i :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'}`" />
          Toggle all
        </Button>
        <Button class="self-center" variant="outline" @click="resetColumns"> Reset </Button>

        <Button
          class="self-center"
          :disabled="!bulkDeleteEnabled"
          variant="destructive"
          @click="$emit('bulk-delete')"
        >
          <i class="fa fa-minus-circle" />
          Delete
        </Button>

        <Button
          class="self-center"
          data-cy="Column-btnExportCSV"
          title="Export columns to CSV"
          variant="outline"
          @click.prevent="displayModalExportCSV"
        >
          <i class="fas fa-file-export" />
          CSV
        </Button>
      </div>

      <PerPageSelector
        :current-page-size="currentPageSize"
        :total-documents="totalDocuments"
        @change-page-size="$emit('change-page-size', $event)"
      />
      <new-documents-badge :has-new-documents="hasNewDocuments" @refresh="$emit('refresh')" />
    </div>
    <div class="my-2 flex">
      <div class="w-3/12">
        <Table class="border border-border" data-cy="ColumnView-table-id">
          <TableHeader>
            <TableRow>
              <TableHead
                v-for="field of tableDefaultHeaders"
                :id="`header-col-${field}`"
                :key="`header-col-${field.key}`"
              >
                {{ field.label }}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <highlightable-row
              v-for="item of formattedItems"
              :key="`item-row-${item._id}`"
              :auto-sync="autoSync"
              :notification="notifications[item._id]"
            >
              <TableCell
                v-for="field of tableDefaultHeaders"
                :id="`col-${item._id}-${field.key}`"
                :key="`item-col-${field.key}`"
                class="cell"
                colspan="1"
                :data-cy="`ColumnItem-${item._id}-${field.key}`"
              >
                <template v-if="field.key === 'acColumnTableActions'">
                  <div class="flex items-center gap-1">
                    <Checkbox
                      :checked="isChecked(item._id)"
                      :data-cy="`ColumnView-table-select-btn--${item._id}`"
                      @change="toggleSelectDocument(item._id)"
                    />
                    <Button
                      :data-cy="`ColumnView-table-edit-btn--${item._id}`"
                      :disabled="!canEdit"
                      size="icon"
                      title="Edit document"
                      variant="ghost"
                      @click="editDocument(item._id)"
                    >
                      <i class="fa fa-pen" />
                    </Button>
                    <Button
                      :data-cy="`ColumnView-table-delete-btn--${item._id}`"
                      :disabled="!canDelete"
                      size="icon"
                      title="Delete document"
                      variant="ghost"
                      @click="deleteDocument(item._id)"
                    >
                      <i class="fa fa-trash" />
                    </Button>
                    <Badge
                      v-if="
                        getItemBadge(item) && !autoSync && getItemBadge(item).label !== 'created'
                      "
                      class="mx-2"
                      :variant="getItemBadge(item).variant"
                      >{{ getItemBadge(item).label }}
                    </Badge>
                  </div>
                </template>
                <template v-else-if="field.key === 'acColumnTableId'">
                  {{ item._id }}
                </template>
              </TableCell>
            </highlightable-row>
          </TableBody>
        </Table>
      </div>
      <div class="w-9/12">
        <Table class="border border-border" data-cy="ColumnView-table-data">
          <TableHeader>
            <draggable
              :value="selectedFields"
              draggable=".draggableItem"
              filter=".ignore"
              handle=".handle"
              tag="tr"
              @input="selectedFields = $event"
            >
              <HeaderTableView
                v-for="field of selectedFields"
                :key="`header-col-${field}`"
                :display-drag-icon="displayDragIcon"
                :field="field"
                @mouseenter="displayDragIcon = true"
                @mouseleave="displayDragIcon = false"
              />
            </draggable>
          </TableHeader>
          <TableBody>
            <highlightable-row
              v-for="item of formattedItems"
              :key="`item-row-${item._id}`"
              :auto-sync="autoSync"
              :notification="notifications[item._id]"
            >
              <ColumnCell
                v-for="field of selectedFields"
                :key="`item-col-${field}`"
                :auto-sync="autoSync"
                :data="item[field]"
                :field-name="field"
                :field-type="flatMapping[field]"
                :row-id="item._id"
              />
            </highlightable-row>
          </TableBody>
        </Table>
      </div>
    </div>

    <Dialog v-model:open="exportCsvOpen">
      <DialogContent class="max-w-2xl" labelled-by="export-csv-title">
        <DialogHeader>
          <DialogTitle id="export-csv-title">CSV export</DialogTitle>
        </DialogHeader>

        <DialogDescription>Click the following link to download your CSV export</DialogDescription>

        <a
          v-if="singleUseToken"
          class="downloadCSVLink inline-flex items-center gap-2 self-start rounded-md bg-secondary px-3 py-2 text-secondary-foreground"
          :href="exportUrl"
          rel="noopener noreferrer"
          target="_blank"
          @click="clearSingleUseToken"
        >
          <i class="fas fa-file-export" />
          Download
        </a>
        <p v-else class="m-0 text-sm text-muted-foreground">Preparing download..</p>

        <DialogFooter>
          <Button variant="outline" @click="exportCsvOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script>
import defaultsDeep from 'lodash/defaultsDeep';
import get from 'lodash/get';
import { mapState } from 'pinia';
import Multiselect from 'vue-multiselect';
import draggable from 'vuedraggable';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import JsonFormatter from '@/directives/json-formatter.directive';
import { flattenObjectMapping } from '@/services/collectionHelper';
import { getBadgeVariant, getBadgeText } from '@/services/documentNotifications';
import { useAuthStore, useKuzzleStore } from '@/stores';
import { truncateName } from '@/utils';

import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NewDocumentsBadge from '@/components/Data/Documents/Common/NewDocumentsBadge.vue';
import HeaderTableView from './HeaderTableView.vue';
import HighlightableRow from './HighlightableRow.vue';
import ColumnCell from './TableCell.vue';
import {} from 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'Column',
  directives: {
    JsonFormatter,
  },
  components: {
    Badge,
    Button,
    Checkbox,
    ColumnCell,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    draggable,
    HeaderTableView,
    HighlightableRow,
    Multiselect,
    NewDocumentsBadge,
    PerPageSelector,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
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
      exportCsvOpen: false,
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
    // Remplace `@shown` et `@hide` de `b-modal` : le jeton à usage unique est
    // demandé à l'ouverture et jeté à la fermeture, quelle qu'en soit la cause.
    exportCsvOpen(open) {
      if (open) {
        this.fetchSingleUseToken();
      } else {
        this.singleUseToken = null;
      }
    },
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
      this.exportCsvOpen = false;
    },
    displayModalExportCSV() {
      this.exportCsvOpen = true;
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
/* Bloc global, pas `scoped` : `.multiselect__*` vise des nœuds rendus par
 * `vue-multiselect`, sur lesquels on ne peut pas poser d'utilitaire. Six règles
 * mortes en sont parties (`.inlineDisplay`, `.dropdownScroll`, `.columnClass`,
 * `.valueDisplayer`, `.dropdown-text`, `.max-w-24rem`). */
.cell {
  height: 65px;
  vertical-align: middle !important;
  white-space: nowrap;
}

.downloadCSVLink {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    'Liberation Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
}

.multiselect__option--selected.multiselect__option--highlight {
  background: #e64472 !important;
}
</style>
