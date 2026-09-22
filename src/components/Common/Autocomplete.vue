<template>
  <div class="Autocomplete">
    <Input
      v-model="inputValue"
      :class="inputClass"
      data-cy="Autocomplete-input"
      :placeholder="placeholder"
      type="text"
      @update:modelValue="onInput"
      @change="onChange"
      @focus="onInput"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter.prevent="onEnter"
    />

    <!--
      Le `<style scoped>` posait les couleurs de la sélection en dur
      (`$blue-color`) ; elles viennent des tokens, comme partout ailleurs.
    -->
    <ul
      v-show="isOpen"
      class="Autocomplete-results m-0 h-30 list-none overflow-auto rounded-md border border-border p-0"
      data-cy="Autocomplete-results"
    >
      <li
        v-for="(result, i) in results"
        :key="result"
        class="Autocomplete-result cursor-pointer px-1 py-1 text-left hover:bg-accent hover:text-accent-foreground"
        :class="i === selectionCursor ? 'is-active bg-accent text-accent-foreground' : ''"
        :data-cy="`autocomplete-item--${result}`"
        @click="setResult(result)"
      >
        {{ result }}
      </li>
    </ul>
  </div>
</template>

<script>
import { Input } from '@/components/ui/input';

export default {
  name: 'Autocomplete',
  components: {
    Input,
  },
  props: {
    item: {
      type: String,
      required: false,
      default: '',
    },
    items: {
      type: Array,
      required: false,
      default: () => {
        return [];
      },
    },
    inputClass: {
      type: String,
      required: false,
      default: '',
    },
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    value: {
      type: String,
      required: false,
      default: '',
    },
    notifyChange: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      inputValue: '',
      results: [],
      isOpen: false,
      selectionCursor: -1,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        this.inputValue = newValue;
      },
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    onChange(evt) {
      if (this.notifyChange) {
        return this.changeResult(evt.target.value);
      }
    },
    onInput() {
      this.isOpen = true;
      this.filterResults();
    },
    filterResults() {
      this.results = this.items.filter(
        (item) => item.toLowerCase().indexOf(this.inputValue.toLowerCase()) > -1,
      );
    },
    setResult(result) {
      this.isOpen = false;
      this.inputValue = result;
      this.$emit('autocomplete::change', result);
      this.inputValue = '';
    },
    changeResult(result) {
      this.$emit('autocomplete::change', result);
      this.inputValue = '';
    },
    onArrowDown() {
      if (this.selectionCursor + 1 < this.results.length) {
        this.selectionCursor = this.selectionCursor + 1;
      }
    },
    onArrowUp() {
      if (this.selectionCursor > 0) {
        this.selectionCursor = this.selectionCursor - 1;
      }
    },
    onEnter() {
      this.setResult(this.results[this.selectionCursor]);
      this.selectionCursor = -1;
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.selectionCursor = -1;
      }
    },
  },
};
</script>
