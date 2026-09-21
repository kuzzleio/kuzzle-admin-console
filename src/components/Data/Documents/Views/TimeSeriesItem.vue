<template>
  <div class="tw:mb-2 tw:mr-1 tw:flex tw:items-center tw:gap-2">
    <div class="tw:relative tw:flex-1">
      <!--
        Le bouton n'a pas de contenu : c'est la pastille de couleur elle-même.
        Sans libellé, il n'existe pas pour un lecteur d'écran — d'où
        `aria-label`, et `aria-expanded` pour l'état du sélecteur.
      -->
      <button
        :aria-expanded="showColorPicker ? 'true' : 'false'"
        aria-label="Choose the color of this value"
        class="tw:h-5 tw:w-full tw:cursor-pointer tw:appearance-none tw:rounded-md tw:border tw:border-border"
        data-cy="TimeSeriesItem-colorPickerBtn"
        :style="{ 'background-color': newColor }"
        type="button"
        @click.prevent="togglePicker"
      />
      <color-picker
        v-show="showColorPicker"
        v-model="newColor"
        class="tw:absolute tw:z-50"
        data-cy="TimeSeriesItem-colorPicker"
        @input="updateColor"
      />
    </div>
    <div class="tw:flex-1">
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
    <div class="tw:flex tw:w-8 tw:items-center tw:justify-center">
      <Button
        v-if="isUpdatable"
        aria-label="Remove this value from the chart"
        class="tw:size-8"
        data-cy="TimeSeriesItem-removeBtn"
        size="icon"
        variant="ghost"
        @click.prevent="$emit('timeseriesitem::remove', index)"
      >
        <i aria-hidden="true" class="far fa-times-circle tw:text-muted-foreground" />
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
  destroyed() {
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
    updateColor(color) {
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
