<template>
  <div class="col s12 TimeSeriesView">
    <div class="row col s10">
      <GChart
        v-if="customNumberFields.length"
        type="LineChart"
        :data="chart"
        :options="chartOptions"
        :resize-debounce="1"
        :settings="{'packages':['corechart'], 'language': 'en'}"
      />
      <div
        v-else
        class="row col s12"
      >
        No data to display
      </div>
    </div>
    <div class="col s2">
      <div class="col s12">
        <autocomplete
          placeholder="Date field"
          :items="mappingDateArray"
          :value="customDateField || ''"
          :notify-change="false"
          @autocomplete::change="attribute => { addDateField(attribute) }"
        />
      </div>
    </div>
    <div class="col s2">
      <form class="TimeSeriesValueSelector">
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
          @autocomplete::change="item => { addNumberField(item) }"
        />
      </form>
    </div>
  </div>
</template>

<script>
import Autocomplete from '../../../Common/Autocomplete'
import TimeSeriesItem from './TimeSeriesItem'
import { GChart } from 'vue-google-charts'

const ES_NUMBER_DATA_TYPE = [
  'short',
  'integer',
  'long',
  'doube',
  'float',
  'half_float',
  'scaled_float',
  'binary'
]

export default {
  name: 'TimeSeries',
  components: {
    Autocomplete,
    GChart,
    TimeSeriesItem
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
  data () {
    return {
      customDateField: null,
      customNumberFields: [],
      mappingDateArray: [],
      mappingNumberArray: [],
      newCustomDateField: null,
      newCustomNumberField: null,
      chartOptions: {
        curveType: 'function',
        colors: [],
        height: 400,
        backgroundColor: {
          fill: '#505050'
        },
        hAxis: {
          gridlineColor: 'grey',
          textStyle: {
            color: '#C8C8C8'
          }
        },
        vAxis: {
          gridlineColor: 'grey',
          textStyle: {
            color: '#C8C8C8'
          }
        },
        legend: {
          textStyle: {
            color: '#C8C8C8'
          },
          position: 'top',
          alignment: 'center'
        },
        explorer: {
          keepInBounds: true
        }
      },
      chart: []
    }
  },
  watch: {
    '$route' (to, from) {
      const columnsConfig = JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}')

      this.customDateField = []
      if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
        this.customDateField = columnsConfig[this.index][this.collection].date
      } else {
        this.customDateField = []
      }

      this.customNumberFields = []
      if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
        this.customNumberFields = columnsConfig[this.index][this.collection].numbers || []
      } else {
        this.customNumberFields = []
      }
    },
    mapping () {
      this.mappingDateArray = this.buildAttributeListFromDate(this.mapping)
      for (const attr of this.customDateField) {
        this.mappingDateArray.splice(this.mappingDateArray.indexOf(attr), 1)
      }

      this.mappingNumberArray = this.buildAttributeListFromNumber(this.mapping)
      for (const attr of this.customNumberFields) {
        this.mappingNumberArray.splice(this.mappingNumberArray.indexOf(attr), 1)
      }
    },
    customNumberFields () {
      this.updateChart()
    }
  },
  mounted () {
    const columnsConfig = JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}')

    if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
      this.customDateField = columnsConfig[this.index][this.collection].date
    }
    this.mappingDateArray = this.buildAttributeListFromDate(this.mapping)
    if (this.customDateField) {
      for (const attr of this.customDateField) {
        this.mappingDateArray.splice(this.mappingDateArray.indexOf(attr), 1)
      }
    }

    if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
      this.customNumberFields = columnsConfig[this.index][this.collection].numbers || []
    }
    this.mappingNumberArray = this.buildAttributeListFromNumber(this.mapping)
    
    if (this.customNumberFields) {
      for (const attr of this.customNumberFields) {
        this.mappingNumberArray.splice(this.mappingNumberArray.indexOf(attr), 1)
      }
    }
  },
  methods: {
    updateChart () {
      this.chartOptions.colors = []
      this.chart = []
      const chartTitles = []
      chartTitles.push(this.customDateField)
  
      for (const item of this.customNumberFields) {
        this.chartOptions.colors.push(item.color)
        chartTitles.push(item.name)
      }
      this.chart.push(chartTitles)

      for (const doc of this.documents) {
        const item = []
        item.push(doc.content[this.customDateField])
        for (const field of this.customNumberFields) {
          item.push(parseInt(doc.content[field.name]))
        }
        this.chart.push(item)
      }
    },
    saveToLocalStorage() {
      if (this.index && this.collection) {
        const config = JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}')
        if (!config[this.index]) {
          config[this.index] = {}
          config[this.index][this.collection] = {}
        }
        config[this.index][this.collection].date = this.customDateField
        config[this.index][this.collection].numbers = this.customNumberFields
        localStorage.setItem('timeSeriesViewConfig', JSON.stringify(config))
      }
    },
    buildAttributeListFromDate(mapping, path = []) {
      let attributes = []

      for (const [attributeName, attributeValue] of Object.entries(mapping)) {
        if (attributeValue.hasOwnProperty('properties')) {
          attributes = attributes.concat(
            this.buildAttributeListFromDate(
              attributeValue.properties,
              path.concat(attributeName)
            )
          )
        } else if (attributeValue.hasOwnProperty('type') && attributeValue.type === 'date') {
          attributes = attributes.concat(path.concat(attributeName).join('.'))
        }
      }

      return attributes
    },
    buildAttributeListFromNumber(mapping, path = []) {
      let attributes = []

      for (const [attributeName, attributeValue] of Object.entries(mapping)) {
        if (attributeValue.hasOwnProperty('properties')) {
          attributes = attributes.concat(
            this.buildAttributeListFromDate(
              attributeValue.properties,
              path.concat(attributeName)
            )
          )
        } else if (attributeValue.hasOwnProperty('type') && ES_NUMBER_DATA_TYPE.includes(attributeValue.type)) {
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
        this.mappingNumberArray.splice(this.mappingNumberArray.indexOf(item.name), 1)
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

<style>
.TimeSeriesValueSelector {
  padding: 0px 10px 0px 10px;
  margin: 0px 10px 0px 10px;
}
</style>
