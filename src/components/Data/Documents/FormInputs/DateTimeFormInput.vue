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

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fromDateTimeInputs, toDateInputValue, toTimeInputValue } from '@/lib/date';
import type { FormField } from '@/services/formSchema';

/*
 * Le champ date est le seul de la console (ADR-0015). Il s'appuie sur les
 * types natifs `date` et `time` plutôt que sur une primitive `Calendar`, que
 * `b-form-datepicker` et `b-form-timepicker` auraient demandé d'écrire à la
 * main pour ce seul site d'appel.
 *
 * Le champ ne détient pas sa valeur : `value` descend de `DocumentForm` et
 * `input` la remonte (ADR-0025). `date` et `time` sont les deux moitiés de la
 * saisie en cours, pas un état du document — c'est leur composition qui fait
 * la valeur.
 */
const props = withDefaults(
  defineProps<{
    schema: FormField;
    value?: string | number | null;
  }>(),
  { value: null },
);

const emit = defineEmits<{
  (e: 'input', value: string): void;
}>();

// Chaînes vides et non `null` : `Input` n'accepte pas `null`, et la valeur
// d'un champ natif vide est la chaîne vide.
const date = ref('');
const time = ref('');

onMounted(() => {
  if (!props.value) {
    return;
  }

  // if no date format specified, ES save date in ms timestamp
  const dateTime =
    'format' in props.schema.mapping && props.schema.mapping.format
      ? new Date(props.value)
      : new Date(parseInt(String(props.value)));

  date.value = toDateInputValue(dateTime);
  time.value = toTimeInputValue(dateTime);
});

/*
 * Les deux champs lisent l'événement natif plutôt que la valeur émise par
 * `Input` : `v-model` et un `@input` posé par le site d'appel visent le
 * même événement, et rien ne garantit lequel des deux est appliqué en
 * premier. `event.target.value` est vrai dans les deux cas.
 */
function inputValue(event: Event): string {
  return event.target instanceof HTMLInputElement ? event.target.value : '';
}

function onDateChange(event: Event): void {
  date.value = inputValue(event);
  emitValue();
}

function onTimeChange(event: Event): void {
  time.value = inputValue(event);
  emitValue();
}

function emitValue(): void {
  emit('input', fromDateTimeInputs(date.value, time.value));
}
</script>
