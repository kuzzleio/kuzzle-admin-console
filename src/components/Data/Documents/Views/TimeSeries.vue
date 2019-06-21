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
      <div class="col s12 bordered">
        <span>Date</span>
        <autocomplete
          placeholder="Date field"
          :items="mappingDateArray"
          :value="customDateField || ''"
          :notify-change="false"
          @autocomplete::change="item => { addDateField(item) }"
        />
      </div>
      <div class="col s12">
        <form class="TimeSeriesValueSelector">
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
            @autocomplete::change="item => { addNumberField(item) }"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Autocomplete from '../../../Common/Autocomplete'
import TimeSeriesItem from './TimeSeriesItem'
import { GChart } from 'vue-google-charts'
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
        legend: {
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

      this.customDateField = null
      if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
        this.customDateField = columnsConfig[this.index][this.collection].date
      } else {
        this.customDateField = null
      }

      this.customNumberFields = []
      if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
        this.customNumberFields = columnsConfig[this.index][this.collection].numbers || []
      } else {
        this.customNumberFields = []
      }
    },
    mapping () {
      this.mappingNumberArray = this.buildAttributeList(this.mapping, type => ES_NUMBER_DATA_TYPE.includes(type))
      if (this.customNumberFields) {
        for (const attr of this.customNumberFields) {
          this.mappingNumberArray.splice(this.mappingNumberArray.indexOf(attr.name), 1)
        }
        this.mappingNumberArray.sort()
      }
    },
    customNumberFields () {
      this.updateChart()
    },
    documents () {
      this.updateChart()
    }
  },
  mounted () {
    const columnsConfig = JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}')

    if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
      this.customDateField = columnsConfig[this.index][this.collection].date
    }
    this.mappingDateArray = this.buildAttributeList(this.mapping, type => type === 'date')

    if (columnsConfig[this.index] && columnsConfig[this.index][this.collection]) {
      this.customNumberFields = columnsConfig[this.index][this.collection].numbers || []
    }
    this.mappingNumberArray = this.buildAttributeList(this.mapping, type => ES_NUMBER_DATA_TYPE.includes(type))
    
    if (this.customNumberFields) {
      for (const attr of this.customNumberFields) {
        this.mappingNumberArray.splice(this.mappingNumberArray.indexOf(attr.name), 1)
      }
      this.mappingNumberArray.sort()
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
          item.push(_.get(doc.content, field.name, ''))
        }
        this.chart.push(item)
      }
    },
    saveToLocalStorage() {
      if (this.index && this.collection) {
        const config = JSON.parse(localStorage.getItem('timeSeriesViewConfig') || '{}')
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
        if (attributeValue.hasOwnProperty('properties')) {
          attributes = attributes.concat(
            this.buildAttributeList(
              attributeValue.properties,
              condition,
              path.concat(attributeName)
            )
          )
        } else if (attributeValue.hasOwnProperty('type') && condition(attributeValue.type)) {
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
.bordered {
  border: .5px solid grey;
  margin-bottom: 10px;
}
</style>
