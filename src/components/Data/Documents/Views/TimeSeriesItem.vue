<template>
  <div class="mb-2 mr-1 flex items-center gap-2">
    <div class="flex-1">
      <!--
        Le sélecteur natif du navigateur (ADR-0035). L'élément est aussi la
        pastille : les pseudo-éléments `color-swatch` retirent le cadre et la
        marge intérieure que chaque moteur lui ajoute.
      -->
      <input
        aria-label="Choose the color of this value"
        class="block h-5 w-full cursor-pointer rounded-md border border-border bg-transparent p-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
        data-cy="TimeSeriesItem-colorPicker"
        type="color"
        :value="newColor"
        @change="commitColor"
        @input="onColorInput"
      />
    </div>
    <div class="flex-1">
      <autocomplete
        v-if="!isUpdatable"
        placeholder="Add a value"
        :items="items"
        :value="newValue"
        :notify-change="false"
        @autocomplete::change="(attribute) => addItem(attribute)"
      />
      <Input v-else disabled :model-value="value" />
    </div>
    <div class="flex w-8 items-center justify-center">
      <Button
        v-if="isUpdatable"
        aria-label="Remove this value from the chart"
        class="size-8"
        data-cy="TimeSeriesItem-removeBtn"
        size="icon"
        variant="ghost"
        @click.prevent="$emit('timeseriesitem::remove', index)"
      >
        <i aria-hidden="true" class="far fa-times-circle text-muted-foreground" />
      </Button>
    </div>
  </div>
</template>
<script lang="ts">
function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Tirée une fois au chargement du module, comme le `default` de l'Options API :
// tous les éléments sans `color` partent de la même teinte. Hors du
// `<script setup>`, car `withDefaults` ne peut pas lire ses variables (G-107).
const DEFAULT_COLOR = getRandomColor();
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import Autocomplete from '@/components/Common/Autocomplete.vue';

const props = withDefaults(
  defineProps<{
    color?: string;
    index?: number;
    isUpdatable?: boolean;
    items?: string[];
    newValue?: string;
    value?: string;
  }>(),
  {
    color: DEFAULT_COLOR,
    index: 0,
    isUpdatable: false,
    items: () => [],
    newValue: '',
    value: '',
  },
);

const emit = defineEmits<{
  (e: 'autocomplete::change', item: { name: string; color: string }): void;
  (e: 'timeseriesitem::remove', index: number): void;
  (e: 'update-color', payload: { color: string; index: number }): void;
}>();

const newColor = ref(props.color);

onMounted(() => {
  newColor.value = props.color;
});

function colorValue(evt: Event): string {
  return evt.target instanceof HTMLInputElement ? evt.target.value : newColor.value;
}

function onColorInput(evt: Event): void {
  newColor.value = colorValue(evt);
}

/*
 * `input` suit le curseur pendant qu'on cherche la teinte et ne met à jour
 * que la pastille ; `change` n'arrive qu'à la fermeture du sélecteur, et
 * c'est lui seul qui redessine le graphique et écrit dans le localStorage.
 */
function commitColor(evt: Event): void {
  newColor.value = colorValue(evt);
  if (props.isUpdatable) {
    emit('update-color', { color: newColor.value, index: props.index });
  }
}

function addItem(attr: string): void {
  emit('autocomplete::change', { name: attr, color: newColor.value });
  newColor.value = getRandomColor();
}
</script>
