<template>
  <b-card class="w-100">
    <b-card-body class="m-0 p-0">
      <b-row>
        <b-col cols="6">
          <b-input-group>
            <b-form-input
              v-model="date"
              data-cy="datePickerInput"
              type="text"
              class="w-50"
              placeholder="YYYY-MM-DD"
              autocomplete="off"
              @input="onDateChange"
            ></b-form-input>
            <b-input-group-append>
              <b-form-datepicker
                v-model="date"
                button-only
                locale="en-GB"
                @input="onDateChange"
              ></b-form-datepicker>
            </b-input-group-append>
          </b-input-group>
        </b-col>
        <b-col cols="6">
          <b-input-group>
            <b-form-input
              v-model="time"
              data-cy="timePickerInput"
              type="text"
              class="w-50"
              placeholder="HH:mm:ss"
              autocomplete="off"
              @input="onTimeChange"
            ></b-form-input>
            <b-input-group-append>
              <b-form-timepicker
                v-model="time"
                button-only
                locale="en-GB"
                :show-seconds="true"
                :hour12="false"
                @input="onTimeChange"
              ></b-form-timepicker>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
    </b-card-body>
  </b-card>
</template>

<script>
// https://vue-generators.gitbook.io/vue-generators/fields/custom_fields
import { abstractField } from 'vue-form-generator' ;
import moment from 'moment' ;

const DATE_PICKER_FORMAT = 'YYYY-MM-DD' ;
const TIME_PICKER_FORMAT = 'HH:mm:ss' ;

export default {
  mixins: [abstractField],
  data() {
    return {
      date: null,
      time: null
    } ;
  },
  mounted() {
    if (!this.value) {
      return ;
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
} ;
</script>
