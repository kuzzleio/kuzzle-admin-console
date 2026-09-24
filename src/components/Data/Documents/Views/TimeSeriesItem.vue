<template>
  <div class="mb-2 mr-1 flex items-center gap-2">
    <div class="relative flex-1">
      <!--
        Le bouton n'a pas de contenu : c'est la pastille de couleur elle-même.
        Sans libellé, il n'existe pas pour un lecteur d'écran — d'où
        `aria-label`, et `aria-expanded` pour l'état du sélecteur.
      -->
      <button
        :aria-expanded="showColorPicker ? 'true' : 'false'"
        aria-label="Choose the color of this value"
        class="h-5 w-full cursor-pointer appearance-none rounded-md border border-border"
        data-cy="TimeSeriesItem-colorPickerBtn"
        :style="{ 'background-color': newColor }"
        type="button"
        @click.prevent="togglePicker"
      />
      <color-picker
        v-show="showColorPicker"
        :value="newColor"
        class="absolute z-50"
        data-cy="TimeSeriesItem-colorPicker"
        @input="updateColor"
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
import { Chrome as ColorPicker } from 'vue-color';

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
    ColorPicker,
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
      showColorPicker: false,
      newColor: this.color,
    };
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);

    this.newColor = this.color;
  },
  unmounted() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.showColorPicker = false;
      }
    },
    togglePicker() {
      this.showColorPicker = !this.showColorPicker;
    },
    /*
     * `vue-color` est écrit pour Vue 2 et ne déclare pas `emits` : ce `@input`
     * est donc aussi posé en écouteur DOM natif sur sa racine, et reçoit les
     * `input` qui remontent de ses propres champs hexadécimal et RVBA (G-049).
     * Une bibliothèque tierce ne pouvant pas être corrigée, c'est le site
     * d'appel qui distingue les deux : l'événement du composant porte un objet
     * couleur, l'événement natif est un `Event`.
     */
    updateColor(color) {
      if (color instanceof Event) {
        return;
      }

      this.newColor = color.hex;
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
