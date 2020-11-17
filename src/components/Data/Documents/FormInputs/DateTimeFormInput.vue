<template>
  <b-card class="w-100">
    <b-card-body class="m-0 p-0">
      <b-row>
        <b-col
          ><b-form-datepicker
            v-model="date"
            class="mb-2"
            @input="onDateChange"
          ></b-form-datepicker
        ></b-col>
        <b-col
          ><b-form-timepicker
            v-model="time"
            class="mb-2"
            @input="onTimeChange"
          ></b-form-timepicker>
        </b-col>
      </b-row>
    </b-card-body>
  </b-card>
</template>

<script>
// https://vue-generators.gitbook.io/vue-generators/fields/custom_fields
import { abstractField } from 'vue-form-generator'
import moment from 'moment'

const DATE_PICKER_FORMAT = 'YYYY-MM-DD'
const TIME_PICKER_FORMAT = 'HH:mm:ss'

export default {
  mixins: [abstractField],
  data() {
    return {
      date: null,
      time: null
    }
  },
  mounted() {
    if (!this.value) {
      return
    }

    // if no date format specified, ES save date in ms timestamp
    const dateTime = this.schema.mapping.format
      ? moment(this.value)
      : moment(parseInt(this.value))

    this.date = dateTime.format(DATE_PICKER_FORMAT)
    this.time = dateTime.format(TIME_PICKER_FORMAT)
  },
  methods: {
    onDateChange(date) {
      this.value = moment(`${date} ${this.time}`).format('x')
    },
    onTimeChange(time) {
      this.value = moment(`${this.date} ${time}`).format('x')
    }
  }
}
</script>
