<template>
  <Card class="w-full">
    <CardContent class="flex flex-col gap-4 sm:flex-row">
      <div class="flex flex-col gap-2 sm:w-1/2">
        <Label :for="`${schema.model}-date`">Date</Label>
        <Input
          :id="`${schema.model}-date`"
          data-cy="datePickerInput"
          :model-value="date"
          type="date"
          @input="onDateChange"
        />
      </div>

      <div class="flex flex-col gap-2 sm:w-1/2">
        <Label :for="`${schema.model}-time`">Time</Label>
        <Input
          :id="`${schema.model}-time`"
          data-cy="timePickerInput"
          :model-value="time"
          step="1"
          type="time"
          @input="onTimeChange"
        />
      </div>
    </CardContent>
  </Card>
</template>

<script>
// https://vue-generators.gitbook.io/vue-generators/fields/custom_fields
import moment from 'moment';
import { abstractField } from 'vue-form-generator';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DATE_PICKER_FORMAT = 'YYYY-MM-DD';
const TIME_PICKER_FORMAT = 'HH:mm:ss';

/*
 * Le champ date est le seul de la console (ADR-0015). Il s'appuie sur les
 * types natifs `date` et `time` plutôt que sur une primitive `Calendar`, que
 * `b-form-datepicker` et `b-form-timepicker` auraient demandé d'écrire à la
 * main pour ce seul site d'appel.
 *
 * `value` vient du mixin `abstractField` de vue-form-generator : y écrire
 * remonte la valeur au modèle du formulaire.
 */
export default {
  components: {
    Card,
    CardContent,
    Input,
    Label,
  },
  mixins: [abstractField],
  data() {
    return {
      date: null,
      time: null,
    };
  },
  mounted() {
    if (!this.value) {
      return;
    }

    // if no date format specified, ES save date in ms timestamp
    const dateTime = this.schema.mapping.format ? moment(this.value) : moment(parseInt(this.value));

    this.date = dateTime.format(DATE_PICKER_FORMAT);
    this.time = dateTime.format(TIME_PICKER_FORMAT);
  },
  methods: {
    /*
     * Les deux champs lisent l'événement natif plutôt que la valeur émise par
     * `Input` : `v-model` et un `@input` posé par le site d'appel visent le
     * même événement, et rien ne garantit lequel des deux est appliqué en
     * premier. `event.target.value` est vrai dans les deux cas.
     */
    onDateChange(event) {
      this.date = event.target.value;
      this.emitValue();
    },
    onTimeChange(event) {
      this.time = event.target.value;
      this.emitValue();
    },
    emitValue() {
      this.value = moment(`${this.date} ${this.time}`).format('x');
    },
  },
};
</script>
