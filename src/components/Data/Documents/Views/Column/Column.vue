<template>
  <div class="Column" data-cy="DocumentList-Column">
    <!--
      La barre passe à la ligne, comme celle de la vue liste : sur une seule
      ligne, les boutons écrasaient le sélecteur de champs à quelques dizaines
      de pixels, et ses options n'étaient plus lisibles ni cliquables.
    -->
    <div class="flex flex-row flex-wrap items-center gap-2">
      <div class="flex flex-1 flex-wrap items-stretch gap-2">
        <div class="inline-block min-w-32 max-w-96 grow basis-32">
          <multiselect
            v-model="selectedFieldsComputed"
            :allow-empty="true"
            data-cy="ColumnView-fieldSelector"
            :close-on-select="false"
            :multiple="true"
            :options="fieldList"
            placeholder="Select fields"
            tag-placeholder="Add custom field"
            :taggable="true"
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
                      :aria-label="`Select document ${item._id}`"
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
                        getItemBadge(item) && !autoSync && getItemBadge(item)?.label !== 'created'
                      "
                      class="mx-2"
                      :variant="getItemBadge(item)?.variant"
                      >{{ getItemBadge(item)?.label }}
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
            <VueDraggable
              v-model="selectedFields"
              draggable=".draggableItem"
              filter=".ignore"
              handle=".handle"
              tag="tr"
            >
              <HeaderTableView
                v-for="field of selectedFields"
                :key="`header-col-${field}`"
                :display-drag-icon="displayDragIcon"
                :field="field"
                @mouseenter="displayDragIcon = true"
                @mouseleave="displayDragIcon = false"
              />
            </VueDraggable>
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
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>CSV export</DialogTitle>
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

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import defaultsDeep from 'lodash/defaultsDeep';
import get from 'lodash/get';
import { VueDraggable } from 'vue-draggable-plus';
import Multiselect from 'vue-multiselect';
import { useRouter } from 'vue-router';

import type { DocumentNotification, KuzzleDocument } from '../../types';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
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
import { flattenObjectMapping } from '@/services/collectionHelper';
import { getBadgeVariant, getBadgeText } from '@/services/documentNotifications';
import type { CollectionSettings } from '@/services/localSettings';
import { useAuthStore, useKuzzleStore } from '@/stores';

import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NewDocumentsBadge from '@/components/Data/Documents/Common/NewDocumentsBadge.vue';
import HeaderTableView from './HeaderTableView.vue';
import HighlightableRow from './HighlightableRow.vue';
import ColumnCell from './TableCell.vue';
import {} from 'vue-multiselect/dist/vue-multiselect.min.css';

/* Une ligne du tableau : l'identifiant, puis un attribut par champ affiché. */
type ColumnItem = Record<string, unknown> & { _id: string };

const props = withDefaults(
  defineProps<{
    allChecked?: boolean;
    autoSync?: boolean;
    collection: string;
    collectionSettings?: CollectionSettings;
    currentPageSize?: number;
    documents: KuzzleDocument[];
    hasNewDocuments?: boolean;
    index: string;
    mapping?: object;
    notifications: Record<string, DocumentNotification | undefined>;
    searchQuery?: object | null;
    selectedDocuments: string[];
    totalDocuments?: number;
  }>(),
  {
    collectionSettings: undefined,
    currentPageSize: undefined,
    mapping: undefined,
    searchQuery: undefined,
    totalDocuments: undefined,
  },
);

const emit = defineEmits<{
  (e: 'bulk-delete'): void;
  (e: 'change-page-size', size: number): void;
  (e: 'checkbox-click', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'edit', id: string): void;
  (e: 'refresh'): void;
  (e: 'settings-updated', settings: CollectionSettings): void;
  (e: 'toggle-all'): void;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const router = useRouter();

const tableDefaultHeaders = [
  {
    key: 'acColumnTableActions',
    label: '',
  },
  {
    key: 'acColumnTableId',
    label: 'Id',
  },
];

const selectedFields = ref<string[]>([]);
const displayDragIcon = ref(false);
const exportCsvOpen = ref(false);
const singleUseToken = ref<string | null>(null);

const exportUrl = computed((): string => {
  const environment = kuzzleStore.currentEnvironment;
  if (!environment) {
    throw new Error('No current environment set');
  }

  const protocol = environment.ssl ? 'https' : 'http';
  const baseUrl = `${protocol}://${environment.host}:${environment.port}`;
  const query = JSON.stringify(props.searchQuery);
  const fields = JSON.stringify(selectedFields.value);

  const url = `${baseUrl}/${props.index}/${props.collection}/_export?format=csv&query=${query}&fields=${fields}`;

  if (singleUseToken.value) {
    return `${url}&jwt=${singleUseToken.value}`;
  }

  return url;
});

const hasSelectedDocuments = computed((): boolean => props.selectedDocuments.length > 0);

const bulkDeleteEnabled = computed(
  (): boolean =>
    authStore.canDeleteDocument(props.index, props.collection) && hasSelectedDocuments.value,
);

const formattedItems = computed((): ColumnItem[] =>
  props.documents.map((d) => {
    const doc: ColumnItem = { _id: d._id };
    for (const key of selectedFields.value) {
      doc[key] = get(d._source, key);
    }
    return doc;
  }),
);

const canEdit = computed((): boolean => {
  if (!props.index || !props.collection) {
    return false;
  }
  return authStore.canEditDocument(props.index, props.collection);
});

const canDelete = computed((): boolean => {
  if (!props.index || !props.collection) {
    return false;
  }
  return authStore.canDeleteDocument(props.index, props.collection);
});

const flatMapping = computed((): Record<string, string> => {
  if (!props.mapping) {
    return {};
  }

  return flattenObjectMapping(props.mapping);
});

const fieldList = computed((): string[] => Object.keys(flatMapping.value));

// Le sélecteur remplace le contenu du tableau plutôt que le tableau : le
// watcher profond de `selectedFields` suit alors la même instance (G-058).
const selectedFieldsComputed = computed({
  get: (): string[] => selectedFields.value,
  set: (value: string[]) => {
    selectedFields.value.splice(0, selectedFields.value.length, ...value);
  },
});

// Remplace `@shown` et `@hide` de `b-modal` : le jeton à usage unique est
// demandé à l'ouverture et jeté à la fermeture, quelle qu'en soit la cause.
watch(exportCsvOpen, (open) => {
  if (open) {
    fetchSingleUseToken();
  } else {
    singleUseToken.value = null;
  }
});

// `currentRoute` est ce que lisait le watcher `$route` : il change à chaque navigation.
watch(router.currentRoute, () => {
  initSelectedFields();
});

watch(
  () => props.mapping,
  () => {
    initSelectedFields();
  },
);

watch(
  selectedFields,
  (value) => {
    emit(
      'settings-updated',
      defaultsDeep({ columnView: { fields: value } }, props.collectionSettings),
    );
  },
  /* `initSelectedFields` et `addCustomField` mutent le tableau sur place — voir G-058. */
  { deep: true },
);

async function fetchSingleUseToken(): Promise<void> {
  singleUseToken.value = await authStore.createSingleUseToken();
}

function clearSingleUseToken(): void {
  singleUseToken.value = null;
  exportCsvOpen.value = false;
}

function displayModalExportCSV(): void {
  exportCsvOpen.value = true;
}

function getItemBadge(item: ColumnItem): { label: string; variant: BadgeVariant } | null {
  const n = props.notifications[item._id];
  if (!n) {
    return null;
  }
  return {
    label: getBadgeText(n.action),
    variant: getBadgeVariant(n.action),
  };
}

function resetColumns(): void {
  selectedFields.value.splice(0, selectedFields.value.length);
}

function isChecked(id: string): boolean {
  return props.selectedDocuments.indexOf(id) > -1;
}

function toggleSelectDocument(id: string): void {
  emit('checkbox-click', id);
}

function initSelectedFields(): void {
  selectedFields.value = get(props.collectionSettings, 'columnView.fields', []);
}

function addCustomField(newField: string): void {
  const trimmedField = newField.trim();
  if (trimmedField && !selectedFields.value.includes(trimmedField)) {
    selectedFields.value.push(trimmedField);
  }
}

function deleteDocument(id: string): void {
  if (canDelete.value) {
    emit('delete', id);
  }
}

function editDocument(id: string): void {
  if (canEdit.value) {
    emit('edit', id);
  }
}

onMounted(() => {
  initSelectedFields();
});
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
  font-family: var(--font-sans);
}

.multiselect__option--selected.multiselect__option--highlight {
  background: var(--primary) !important;
}
</style>
