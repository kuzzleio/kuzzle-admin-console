<template>
  <div class="TimeSeriesView" data-cy="TimeSeriesView-container">
    <div v-if="isChartViewAvailable" class="grid grid-cols-12 gap-4">
      <Card class="col-span-12 py-4 md:col-span-3">
        <CardContent class="flex flex-col gap-4 px-4">
          <PerPageSelector
            :current-page-size="currentPageSize"
            :total-documents="totalDocuments"
            @change-page-size="$emit('change-page-size', $event)"
          />
          <div class="flex flex-col gap-2">
            <span id="timeseriesView-dateLabel" class="text-sm">Date</span>
            <Select :model-value="customDateField || ''" @update:modelValue="addDateField">
              <SelectTrigger
                aria-labelledby="timeseriesView-dateLabel"
                data-cy="timeseriesView-dateSelector"
              >
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="field of mappingDateArray" :key="field" :value="field">
                  {{ field }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <form
            class="TimeSeriesValueSelector flex flex-col gap-2"
            data-cy="TimeSeriesValueSelector"
          >
            <span class="text-sm">Values</span>
            <time-series-item
              v-for="(number, key) of customNumberFields"
              :key="key"
              :data-cy="`timeSeries-item--${customNumberFields[key].name}`"
              :value="customNumberFields[key].name"
              :color="customNumberFields[key].color"
              :is-updatable="true"
              :index="key"
              @update-color="updateColor"
              @timeseriesitem::remove="removeItem"
            />
            <time-series-item
              data-cy="timeSeries-item"
              :items="mappingNumberArray"
              :new-value="newCustomNumberField || ''"
              @update-color="updateColor"
              @autocomplete::change="
                (item) => {
                  addNumberField(item);
                }
              "
            />
          </form>
        </CardContent>
      </Card>
      <div class="col-span-12 h-full min-h-96 md:col-span-9">
        <ApexChart
          v-show="customNumberFields.length"
          ref="Chart"
          class="h-full w-full"
          data-cy="timeSeries-chart"
          type="line"
          :series="series"
          :options="chartOptions"
        />
        <Card
          v-if="!customNumberFields.length"
          class="EmptyState h-full items-center justify-center bg-muted text-center"
        >
          <CardContent>
            <i aria-hidden="true" class="fas fa-file-alt fa-6x mb-3 text-muted-foreground" />
            <h2 class="m-0 font-heading text-headline font-extrabold text-muted-foreground">
              You must select at least one field
            </h2>
          </CardContent>
        </Card>
      </div>
    </div>
    <Card
      v-else-if="!customNumberFields.length"
      class="EmptyState h-full items-center justify-center bg-muted text-center"
    >
      <CardContent>
        <i aria-hidden="true" class="fas fa-file-alt fa-6x mb-3 text-muted-foreground" />
        <h2 class="m-0 font-heading text-headline font-extrabold text-muted-foreground">
          No data to display
        </h2>
        <p class="mt-2 mb-0 text-sm text-muted-foreground">
          You can only use chart view on collection that has mapping with fields of date and numeric
          fields...
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';
import _ from 'lodash';
import { useRouter } from 'vue-router';

import type { KuzzleDocument } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/composables/useTheme';
import { dateFromTimestamp } from '@/utils';

import ApexChart from '@/components/Common/ApexChart.vue';
import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import TimeSeriesItem from './TimeSeriesItem.vue';

const ES_NUMBER_DATA_TYPE = [
  'short',
  'integer',
  'long',
  'double',
  'float',
  'half_float',
  'scaled_float',
  'binary',
  'byte',
];

/* Une série du graphique : un champ numérique et sa couleur, retenus dans le localStorage. */
interface NumberField {
  name: string;
  color: string;
}

/* Les options du graphique que la vue écrit ; `ApexChart` les passe au moteur. */
interface ChartOptions {
  chart: { background: string; type: 'line' };
  colors: string[];
  theme: { mode: 'dark' | 'light' };
  xaxis: { categories: string[] };
}

/*
 * La valeur d'un point, telle qu'ApexCharts la lit d'une série de nombres :
 * `Utils.parseNumber` garde un nombre et `null`, et passe le reste à
 * `parseFloat`. La conversion a lieu ici plutôt que dans le moteur, pour que
 * la série ait le type qu'il déclare.
 */
function toChartValue(value: unknown): number | null {
  if (typeof value === 'number' || value === null) {
    return value;
  }
  return parseFloat(String(value));
}

const props = withDefaults(
  defineProps<{
    collection: string;
    currentPageSize?: number;
    documents: KuzzleDocument[];
    index: string;
    mapping?: object;
    totalDocuments?: number;
  }>(),
  {
    currentPageSize: 25,
    mapping: () => ({}),
    totalDocuments: undefined,
  },
);

const emit = defineEmits<{
  (e: 'change-page-size', size: number): void;
  (e: 'changeDisplayPagination', display: boolean): void;
}>();

const { isDark } = useTheme();
const router = useRouter();

const chart = useTemplateRef<InstanceType<typeof ApexChart>>('Chart');

const customDateField = ref<string | null>(null);
const customNumberFields = ref<NumberField[]>([]);
const mappingDateArray = ref<string[]>([]);
const mappingNumberArray = ref<string[]>([]);
const newCustomDateField = ref<string | null>(null);
const newCustomNumberField = ref<string | null>(null);
const chartOptions = reactive<ChartOptions>({
  // Axes, grille et info-bulles suivent le thème (ADR-0056) ; le fond
  // reste celui de la carte, les séries gardent leurs couleurs.
  chart: {
    background: 'transparent',
    type: 'line',
  },
  colors: [],
  theme: {
    mode: isDark.value ? 'dark' : 'light',
  },
  xaxis: {
    categories: [],
  },
});
const series = ref<{ name: string; data: (number | null)[] }[]>([]);

const isChartViewAvailable = computed((): boolean =>
  Boolean(
    (mappingDateArray.value.length || customDateField.value) &&
    (mappingNumberArray.value.length || customNumberFields.value.length),
  ),
);

function readConfig(): Record<
  string,
  Record<string, { date?: string | null; numbers?: NumberField[] }>
> {
  return JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}');
}

watch(isDark, (value) => {
  chartOptions.theme = { mode: value ? 'dark' : 'light' };
  chart.value?.updateOptions({ theme: chartOptions.theme });
});

// `currentRoute` est ce que lisait le watcher `$route` : il change à chaque navigation.
watch(router.currentRoute, () => {
  const columnsConfig = readConfig();

  customDateField.value = null;
  if (columnsConfig[props.index] && columnsConfig[props.index][props.collection]) {
    customDateField.value = columnsConfig[props.index][props.collection].date ?? null;
  } else {
    customDateField.value = null;
  }

  customNumberFields.value = [];
  if (columnsConfig[props.index] && columnsConfig[props.index][props.collection]) {
    customNumberFields.value = columnsConfig[props.index][props.collection].numbers || [];
  } else {
    customNumberFields.value = [];
  }
});

watch(
  () => props.mapping,
  () => {
    mappingNumberArray.value = buildAttributeList(props.mapping, (type) =>
      ES_NUMBER_DATA_TYPE.includes(type),
    );
    if (customNumberFields.value) {
      for (const attr of customNumberFields.value) {
        mappingNumberArray.value.splice(mappingNumberArray.value.indexOf(attr.name), 1);
      }
      mappingNumberArray.value.sort();
    }
  },
);

watch(
  customNumberFields,
  (value) => {
    if (value.length) {
      emit('changeDisplayPagination', true);
      updateChart();
    } else {
      emit('changeDisplayPagination', false);
    }
  },
  /* `addNumberField` et `removeItem` mutent le tableau sur place — voir G-058. */
  { deep: true },
);

watch(
  () => props.documents,
  () => {
    updateChart();
  },
);

watch(isChartViewAvailable, (value) => {
  if (!value) {
    emit('changeDisplayPagination', false);
    return;
  }
  if (!customNumberFields.value.length) {
    emit('changeDisplayPagination', false);
    return;
  }
  emit('changeDisplayPagination', true);
});

onMounted(() => {
  const columnsConfig = readConfig();

  if (columnsConfig[props.index] && columnsConfig[props.index][props.collection]) {
    customDateField.value = columnsConfig[props.index][props.collection].date ?? null;
  }
  mappingDateArray.value = buildAttributeList(props.mapping, (type) => type === 'date');

  if (columnsConfig[props.index] && columnsConfig[props.index][props.collection]) {
    customNumberFields.value = columnsConfig[props.index][props.collection].numbers || [];
  }
  mappingNumberArray.value = buildAttributeList(props.mapping, (type) =>
    ES_NUMBER_DATA_TYPE.includes(type),
  );

  if (customNumberFields.value.length) {
    for (const attr of customNumberFields.value) {
      mappingNumberArray.value.splice(mappingNumberArray.value.indexOf(attr.name), 1);
    }
    mappingNumberArray.value.sort();
  } else {
    emit('changeDisplayPagination', false);
  }
});

function updateChart(): void {
  if (!customNumberFields.value.length) {
    return;
  }

  /*
   * Une recherche renvoie des `{ _id, _source }` : les champs sont sous
   * `_source`. Lus sur le document lui-même, ils valaient tous `null`, et
   * aucun point n'était tracé — depuis la v4 (G-101).
   *
   * Les abscisses sont construites une fois, pour toutes les séries : elles
   * s'ajoutaient auparavant à chaque série et à chaque mise à jour.
   */
  const points: { date: Date; source: Record<string, unknown> }[] = [];
  for (const doc of props.documents) {
    const date = dateFromTimestamp(_.get(doc._source, customDateField.value ?? '', null));

    if (date !== null) {
      points.push({ date, source: doc._source });
    }
  }

  chartOptions.colors = customNumberFields.value.map((field) => field.color);
  chartOptions.xaxis.categories = points.map(({ date }) => date.toLocaleString('en-GB'));

  if (chart.value) {
    chart.value.updateOptions(chartOptions);
  }
  series.value = customNumberFields.value.map((field) => ({
    name: field.name,
    data: points.map(({ source }) => toChartValue(_.get(source, field.name, null))),
  }));
}

function saveToLocalStorage(): void {
  if (props.index && props.collection) {
    const config = readConfig();
    if (!config[props.index]) {
      config[props.index] = {};
    }
    if (!config[props.index][props.collection]) {
      config[props.index][props.collection] = {};
    }
    config[props.index][props.collection].date = customDateField.value;
    config[props.index][props.collection].numbers = customNumberFields.value;
    localStorage.setItem('timeSeriesViewConfig', JSON.stringify(config));
  }
}

function buildAttributeList(
  mapping: object,
  condition: (type: string) => boolean = () => true,
  path: string[] = [],
): string[] {
  let attributes: string[] = [];

  for (const [attributeName, attributeValue] of Object.entries(mapping)) {
    if (Object.prototype.hasOwnProperty.call(attributeValue, 'properties')) {
      attributes = attributes.concat(
        buildAttributeList(attributeValue.properties, condition, path.concat(attributeName)),
      );
    } else if (
      Object.prototype.hasOwnProperty.call(attributeValue, 'type') &&
      condition(attributeValue.type)
    ) {
      attributes = attributes.concat(path.concat(attributeName).join('.'));
    }
  }

  return attributes;
}

function updateColor(data: { color: string; index: number }): void {
  customNumberFields.value[data.index].color = data.color;
  saveToLocalStorage();
  updateChart();
}

function addDateField(attr: unknown): void {
  newCustomDateField.value = typeof attr === 'string' ? attr : null;
  if (newCustomDateField.value) {
    customDateField.value = newCustomDateField.value;
    newCustomDateField.value = null;
    saveToLocalStorage();
    updateChart();
  }
}

function addNumberField(item: NumberField): void {
  if (item.name) {
    customNumberFields.value.push({ name: item.name, color: item.color });
    mappingNumberArray.value.splice(mappingNumberArray.value.indexOf(item.name), 1);
    saveToLocalStorage();
    updateChart();
  }
}

function removeItem(index: number): void {
  mappingNumberArray.value.push(customNumberFields.value[index].name);
  customNumberFields.value.splice(index, 1);
  saveToLocalStorage();
  if (customNumberFields.value.length) {
    updateChart();
  }
}
</script>
