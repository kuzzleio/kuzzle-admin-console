<template>
  <div class="TimeSeriesView">
    <div class="row" v-if="customNumberFields.length">
      <b-col lg="8">
        <VueApexCharts
          class="w-100"
          type="line"
          ref="Chart"
          :series="series"
          :options="chartOptions"
        />
      </b-col>
      <b-col lg="4" class="card p-3">
        <span>Date</span>
        <autocomplete
          placeholder="Date field"
          :items="mappingDateArray"
          :value="customDateField || ''"
          :notify-change="false"
          @autocomplete::change="
            item => {
              addDateField(item)
            }
          "
        />
        <form class="TimeSeriesValueSelector mt-2">
          <span>Values</span>
          <time-series-item
            v-for="(number, key) of customNumberFields"
            :key="key"
            :value="customNumberFields[key].name"
            :color="customNumberFields[key].color"
            :is-updatable="true"
            :index="key"
            @update-color="updateColor"
            @timeseriesitem::remove="removeItem"
          />
          <time-series-item
            :items="mappingNumberArray"
            :new-value="newCustomNumberField || ''"
            @update-color="updateColor"
            @autocomplete::change="
              item => {
                addNumberField(item)
              }
            "
          />
        </form>
      </b-col>
    </div>
    <div v-else class="row col s12">No data to display</div>
  </div>
</template>

<script>
import Autocomplete from '../../../Common/Autocomplete'
import TimeSeriesItem from './TimeSeriesItem'
import VueApexCharts from 'vue-apexcharts'
import _ from 'lodash'

const ES_NUMBER_DATA_TYPE = [
  'short',
  'integer',
  'long',
  'double',
  'float',
  'half_float',
  'scaled_float',
  'binary',
  'byte'
]

export default {
  name: 'TimeSeries',
  components: {
    Autocomplete,
    TimeSeriesItem,
    VueApexCharts
  },
  props: {
    mapping: {
      type: Object,
      default: () => {
        return {}
      }
    },
    index: {
      type: String,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    documents: {
      type: Array,
      required: true
    }
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
          type: 'line'
        },
        colors: [],
        xaxis: {
          categories: []
        }
      },
      series: []
    }
  },
  watch: {
    $route() {
      const columnsConfig = JSON.parse(
        localStorage.getItem('timeSeriesViewConfig') || '{}'
      )

      this.customDateField = null
      if (
        columnsConfig[this.index] &&
        columnsConfig[this.index][this.collection]
      ) {
        this.customDateField = columnsConfig[this.index][this.collection].date
      } else {
        this.customDateField = null
      }

      this.customNumberFields = []
      if (
        columnsConfig[this.index] &&
        columnsConfig[this.index][this.collection]
      ) {
        this.customNumberFields =
          columnsConfig[this.index][this.collection].numbers || []
      } else {
        this.customNumberFields = []
      }
    },
    mapping() {
      this.mappingNumberArray = this.buildAttributeList(this.mapping, type =>
        ES_NUMBER_DATA_TYPE.includes(type)
      )
      if (this.customNumberFields) {
        for (const attr of this.customNumberFields) {
          this.mappingNumberArray.splice(
            this.mappingNumberArray.indexOf(attr.name),
            1
          )
        }
        this.mappingNumberArray.sort()
      }
    },
    customNumberFields() {
      this.updateChart()
    },
    documents() {
      this.updateChart()
    }
  },
  mounted() {
    const columnsConfig = JSON.parse(
      localStorage.getItem('timeSeriesViewConfig') || '{}'
    )

    if (
      columnsConfig[this.index] &&
      columnsConfig[this.index][this.collection]
    ) {
      this.customDateField = columnsConfig[this.index][this.collection].date
    }
    this.mappingDateArray = this.buildAttributeList(
      this.mapping,
      type => type === 'date'
    )

    if (
      columnsConfig[this.index] &&
      columnsConfig[this.index][this.collection]
    ) {
      this.customNumberFields =
        columnsConfig[this.index][this.collection].numbers || []
    }
    this.mappingNumberArray = this.buildAttributeList(this.mapping, type =>
      ES_NUMBER_DATA_TYPE.includes(type)
    )

    if (this.customNumberFields) {
      for (const attr of this.customNumberFields) {
        this.mappingNumberArray.splice(
          this.mappingNumberArray.indexOf(attr.name),
          1
        )
      }
      this.mappingNumberArray.sort()
    }
  },
  methods: {
    updateChart() {
      this.series = []
      this.chartOptions.colors = []
      for (const item of this.customNumberFields) {
        this.chartOptions.colors.push(item.color)
      }

      const series = []
      for (const field of this.customNumberFields) {
        const serie = {
          name: field.name,
          data: []
        }
        for (const doc of this.documents) {
          serie.data.push(_.get(doc, field.name, ''))
        }
        series.push(serie)
      }
      if (this.$refs.Chart) {
        this.$refs.Chart.updateOptions(this.chartOptions)
      }
      this.series = series
    },
    saveToLocalStorage() {
      if (this.index && this.collection) {
        const config = JSON.parse(
          localStorage.getItem('timeSeriesViewConfig') || '{}'
        )
        if (!config[this.index]) {
          config[this.index] = {}
        }
        if (!config[this.index][this.collection]) {
          config[this.index][this.collection] = {}
        }
        config[this.index][this.collection].date = this.customDateField
        config[this.index][this.collection].numbers = this.customNumberFields
        localStorage.setItem('timeSeriesViewConfig', JSON.stringify(config))
      }
    },
    buildAttributeList(mapping, condition = () => true, path = []) {
      let attributes = []

      for (const [attributeName, attributeValue] of Object.entries(mapping)) {
        if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'properties')
        ) {
          attributes = attributes.concat(
            this.buildAttributeList(
              attributeValue.properties,
              condition,
              path.concat(attributeName)
            )
          )
        } else if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'type') &&
          condition(attributeValue.type)
        ) {
          attributes = attributes.concat(path.concat(attributeName).join('.'))
        }
      }

      return attributes
    },
    updateColor(data) {
      this.customNumberFields[data.index].color = data.color
      this.saveToLocalStorage()
      this.updateChart()
    },
    addDateField(attr) {
      this.newCustomDateField = attr
      if (this.newCustomDateField) {
        this.customDateField = this.newCustomDateField
        this.newCustomDateField = null
        this.saveToLocalStorage()
        this.updateChart()
      }
    },
    addNumberField(item) {
      if (item.name) {
        this.customNumberFields.push({ name: item.name, color: item.color })
        this.mappingNumberArray.splice(
          this.mappingNumberArray.indexOf(item.name),
          1
        )
        this.saveToLocalStorage()
        this.updateChart()
      }
    },
    removeItem(index) {
      this.mappingNumberArray.push(this.customNumberFields[index].name)
      this.customNumberFields.splice(index, 1)
      this.saveToLocalStorage()
      this.updateChart()
    }
  }
}
</script>
