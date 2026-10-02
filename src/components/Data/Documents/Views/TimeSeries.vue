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
        // ApexCharts écrit le nom des séries en `innerHTML` (légende,
        // info-bulle) : c'est un nom de champ du mapping, il est échappé.
        legend: {
          formatter: (seriesName) => _.escape(seriesName),
        },
        tooltip: {
          y: {
            title: {
              formatter: (seriesName) => _.escape(seriesName),
            },
          },
        },
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

      /*
       * Une recherche renvoie des `{ _id, _source }` : les champs sont sous
       * `_source`. Lus sur le document lui-même, ils valaient tous `null`, et
       * aucun point n'était tracé.
       *
       * Les abscisses sont construites une fois, pour toutes les séries : elles
       * s'ajoutaient auparavant à chaque série et à chaque mise à jour.
       */
      const points = [];
      for (const doc of this.documents) {
        const date = dateFromTimestamp(_.get(doc._source, this.customDateField, null));

        if (date !== null) {
          points.push({ date, source: doc._source });
        }
      }

      this.chartOptions.colors = this.customNumberFields.map((field) => field.color);
      this.chartOptions.xaxis.categories = points.map(({ date }) => date.toLocaleString('en-GB'));

      if (this.$refs.Chart) {
        this.$refs.Chart.updateOptions(this.chartOptions);
      }
      this.series = this.customNumberFields.map((field) => ({
        name: field.name,
        data: points.map(({ source }) => _.get(source, field.name, null)),
      }));
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
