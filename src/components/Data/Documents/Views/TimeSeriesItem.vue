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
        @input="newColor = $event.target.value"
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
<script>
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import Autocomplete from '@/components/Common/Autocomplete.vue';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default {
  name: 'TimeSeriesItem',
  components: {
    Autocomplete,
    Button,
    Input,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: getRandomColor(),
    },
    isUpdatable: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => {
        return [];
      },
    },
    newValue: {
      type: String,
      default: '',
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      newColor: this.color,
    };
  },
  mounted() {
    this.newColor = this.color;
  },
  methods: {
    /*
     * `input` suit le curseur pendant qu'on cherche la teinte et ne met à jour
     * que la pastille ; `change` n'arrive qu'à la fermeture du sélecteur, et
     * c'est lui seul qui redessine le graphique et écrit dans le localStorage.
     */
    commitColor(evt) {
      this.newColor = evt.target.value;
      if (this.isUpdatable) {
        this.$emit('update-color', { color: this.newColor, index: this.index });
      }
    },
    addItem(attr) {
      this.$emit('autocomplete::change', { name: attr, color: this.newColor });
      this.newColor = getRandomColor();
    },
  },
};
</script>
