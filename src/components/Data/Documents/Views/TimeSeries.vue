<template>
  <div class="TimeSeriesView" data-cy="TimeSeriesView-container">
    <div v-if="isChartViewAvailable" class="tw:grid tw:grid-cols-12 tw:gap-4">
      <Card class="tw:col-span-3 tw:py-4">
        <CardContent class="tw:flex tw:flex-col tw:gap-4 tw:px-4">
          <PerPageSelector
            :current-page-size="currentPageSize"
            :total-documents="totalDocuments"
            @change-page-size="$emit('change-page-size', $event)"
          />
          <div class="tw:flex tw:flex-col tw:gap-2">
            <span id="timeseriesView-dateLabel" class="tw:text-sm">Date</span>
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
            class="TimeSeriesValueSelector tw:flex tw:flex-col tw:gap-2"
            data-cy="TimeSeriesValueSelector"
          >
            <span class="tw:text-sm">Values</span>
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
      <div class="tw:col-span-9 tw:h-full">
        <VueApexCharts
          v-show="customNumberFields.length"
          ref="Chart"
          class="tw:h-full tw:w-full"
          data-cy="timeSeries-chart"
          type="line"
          :series="series"
          :options="chartOptions"
        />
        <Card
          v-if="!customNumberFields.length"
          class="EmptyState tw:h-full tw:items-center tw:justify-center tw:bg-muted tw:text-center"
        >
          <CardContent>
            <i aria-hidden="true" class="fas fa-file-alt fa-6x tw:mb-3 tw:text-muted-foreground" />
            <h2 class="tw:m-0 tw:text-xl tw:font-bold tw:text-muted-foreground">
              You must select at least one field
            </h2>
          </CardContent>
        </Card>
      </div>
    </div>
    <Card
      v-else-if="!customNumberFields.length"
      class="EmptyState tw:h-full tw:items-center tw:justify-center tw:bg-muted tw:text-center"
    >
      <CardContent>
        <i aria-hidden="true" class="fas fa-file-alt fa-6x tw:mb-3 tw:text-muted-foreground" />
        <h2 class="tw:m-0 tw:text-xl tw:font-bold tw:text-muted-foreground">No data to display</h2>
        <p class="tw:mt-2 tw:mb-0 tw:text-sm tw:text-muted-foreground">
          You can only use chart view on collection that has mapping with fields of date and numeric
          fields...
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script>
import _ from 'lodash';
import VueApexCharts from 'vue-apexcharts';

import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dateFromTimestamp } from '@/utils';

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

export default {
  name: 'TimeSeries',
  components: {
    Card,
    CardContent,
    PerPageSelector,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    TimeSeriesItem,
    VueApexCharts,
  },
  props: {
    mapping: {
      type: Object,
      default: () => {
        return {};
      },
    },
    index: {
      type: String,
      required: true,
    },
    collection: {
      type: String,
      required: true,
    },
    documents: {
      type: Array,
      required: true,
    },
    currentPageSize: {
      type: Number,
      default: 25,
    },
    totalDocuments: {
      type: Number,
    },
  },
  data() {
    return {
      customDateField: null,
      customNumberFields: [],
      mappingDateArray: [],
      mappingNumberArray: [],
      newCustomDateField: null,
      newCustomNumberField: null,
      chartOptions: {
        chart: {
          type: 'line',
        },
        colors: [],
        xaxis: {
          categories: [],
        },
      },
      series: [],
    };
  },
  computed: {
    isChartViewAvailable() {
      return Boolean(
        (this.mappingDateArray.length || this.customDateField) &&
        (this.mappingNumberArray.length || this.customNumberFields.length),
      );
    },
  },
  watch: {
    $route() {
      const columnsConfig = JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}');

      this.customDateField = null;
      if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
        this.customDateField = columnsConfig[this.index][this.collection].date;
      } else {
        this.customDateField = null;
      }

      this.customNumberFields = [];
      if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
        this.customNumberFields = columnsConfig[this.index][this.collection].numbers || [];
      } else {
        this.customNumberFields = [];
      }
    },
    mapping() {
      this.mappingNumberArray = this.buildAttributeList(this.mapping, (type) =>
        ES_NUMBER_DATA_TYPE.includes(type),
      );
      if (this.customNumberFields) {
        for (const attr of this.customNumberFields) {
          this.mappingNumberArray.splice(this.mappingNumberArray.indexOf(attr.name), 1);
        }
        this.mappingNumberArray.sort();
      }
    },
    customNumberFields(value) {
      if (value.length) {
        this.$emit('changeDisplayPagination', true);
        this.updateChart();
      } else {
        this.$emit('changeDisplayPagination', false);
      }
    },
    documents() {
      this.updateChart();
    },
    isChartViewAvailable(value) {
      if (!value) {
        this.$emit('changeDisplayPagination', false);
        return;
      }
      if (!this.customNumberFields.length) {
        this.$emit('changeDisplayPagination', false);
        return;
      }
      this.$emit('changeDisplayPagination', true);
    },
  },
  mounted() {
    const columnsConfig = JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}');

    if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
      this.customDateField = columnsConfig[this.index][this.collection].date;
    }
    this.mappingDateArray = this.buildAttributeList(this.mapping, (type) => type === 'date');

    if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
      this.customNumberFields = columnsConfig[this.index][this.collection].numbers || [];
    }
    this.mappingNumberArray = this.buildAttributeList(this.mapping, (type) =>
      ES_NUMBER_DATA_TYPE.includes(type),
    );

    if (this.customNumberFields.length) {
      for (const attr of this.customNumberFields) {
        this.mappingNumberArray.splice(this.mappingNumberArray.indexOf(attr.name), 1);
      }
      this.mappingNumberArray.sort();
    } else {
      this.$emit('changeDisplayPagination', false);
    }
  },
  methods: {
    updateChart() {
      if (!this.customNumberFields.length) {
        return;
      }
      this.series = [];
      this.chartOptions.colors = [];
      for (const item of this.customNumberFields) {
        this.chartOptions.colors.push(item.color);
      }

      const series = [];
      for (const field of this.customNumberFields) {
        const serie = {
          name: field.name,
          data: [],
        };
        for (const doc of this.documents) {
          const timestamp = _.get(doc, this.customDateField, null);
          const date = dateFromTimestamp(timestamp);

          if (date == null) {
            continue;
          }

          serie.data.push(_.get(doc, field.name, ''));
          this.chartOptions.xaxis.categories.push(date.toLocaleString('en-GB'));
        }
        series.push(serie);
      }
      if (this.$refs.Chart) {
        this.$refs.Chart.updateOptions(this.chartOptions);
      }
      this.series = series;
    },
    saveToLocalStorage() {
      if (this.index && this.collection) {
        const config = JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}');
        if (!config[this.index]) {
          config[this.index] = {};
        }
        if (!config[this.index][this.collection]) {
          config[this.index][this.collection] = {};
        }
        config[this.index][this.collection].date = this.customDateField;
        config[this.index][this.collection].numbers = this.customNumberFields;
        localStorage.setItem('timeSeriesViewConfig', JSON.stringify(config));
      }
    },
    buildAttributeList(mapping, condition = () => true, path = []) {
      let attributes = [];

      for (const [attributeName, attributeValue] of Object.entries(mapping)) {
        if (Object.prototype.hasOwnProperty.call(attributeValue, 'properties')) {
          attributes = attributes.concat(
            this.buildAttributeList(
              attributeValue.properties,
              condition,
              path.concat(attributeName),
            ),
          );
        } else if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'type') &&
          condition(attributeValue.type)
        ) {
          attributes = attributes.concat(path.concat(attributeName).join('.'));
        }
      }

      return attributes;
    },
    updateColor(data) {
      this.customNumberFields[data.index].color = data.color;
      this.saveToLocalStorage();
      this.updateChart();
    },
    addDateField(attr) {
      this.newCustomDateField = attr;
      if (this.newCustomDateField) {
        this.customDateField = this.newCustomDateField;
        this.newCustomDateField = null;
        this.saveToLocalStorage();
        this.updateChart();
      }
    },
    addNumberField(item) {
      if (item.name) {
        this.customNumberFields.push({ name: item.name, color: item.color });
        this.mappingNumberArray.splice(this.mappingNumberArray.indexOf(item.name), 1);
        this.saveToLocalStorage();
        this.updateChart();
      }
    },
    removeItem(index) {
      this.mappingNumberArray.push(this.customNumberFields[index].name);
      this.customNumberFields.splice(index, 1);
      this.saveToLocalStorage();
      if (this.customNumberFields.length) {
        this.updateChart();
      }
    },
  },
};
</script>
