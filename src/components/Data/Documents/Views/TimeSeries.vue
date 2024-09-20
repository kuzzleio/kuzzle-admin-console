<template>
  <div class="TimeSeriesView" data-cy="TimeSeriesView-container">
    <b-row v-if="isChartViewAvailable">
      <b-col lg="3" class="card p-3">
        <div class="mt-2 mb-3">
          <PerPageSelector
            :current-page-size="currentPageSize"
            :total-documents="totalDocuments"
            @change-page-size="$emit('change-page-size', $event)"
          />
        </div>
        <span>Date</span>
        <b-form-select
          v-model="customDateField"
          data-cy="timeseriesView-dateSelector"
          :options="mappingDateArray"
          @input="
            (value) => {
              addDateField(value);
            }
          "
        />
        <form class="TimeSeriesValueSelector mt-4">
          <span>Values</span>
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
      </b-col>
      <b-col lg="9" class="h-100">
        <VueApexCharts
          v-show="customNumberFields.length"
          ref="Chart"
          class="w-100 h-100"
          data-cy="timeSeries-chart"
          type="line"
          :series="series"
          :options="chartOptions"
        />
        <b-card
          v-if="!customNumberFields.length"
          class="EmptyState h-100 text-center"
          bg-variant="light"
        >
          <i class="text-secondary fas fa-file-alt fa-6x mb-3" />
          <h2 class="text-secondary font-weight-bold">You must select at least one field</h2>
        </b-card>
      </b-col>
    </b-row>
    <b-row v-else>
      <b-col cols="12">
        <b-card
          v-if="!customNumberFields.length"
          class="EmptyState h-100 text-center"
          bg-variant="light"
        >
          <i class="text-secondary fas fa-file-alt fa-6x mb-3" />
          <h2 class="text-secondary font-weight-bold">No data to display</h2>
          <p>
            You can only use chart view on collection that has mapping with fields of date and
            numeric fields...
          </p>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import _ from 'lodash';
import VueApexCharts from 'vue-apexcharts';

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
    TimeSeriesItem,
    VueApexCharts,
    PerPageSelector,
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
      itemsPerPage: [10, 25, 50, 100, 500],
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

          if (!date) {
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
