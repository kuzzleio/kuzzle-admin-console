<template>
  <div class="Autocomplete">
    <b-form-input
      v-model="inputValue"
      type="text"
      :class="inputClass"
      :placeholder="placeholder"
      @input="onInput"
      @change="onChange"
      @focus="onInput"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter.prevent="onEnter"
    />

    <ul v-show="isOpen" class="Autocomplete-results">
      <li
        v-for="(result, i) in results"
        :data-cy="`autocomplete-item--${result}`"
        :key="result"
        class="Autocomplete-result"
        :class="{ 'is-active': i === selectionCursor }"
        @click="setResult(result)"
      >
        {{ result }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Autocomplete',
  props: {
    item: {
      type: String,
      required: false,
      default: ''
    },
    items: {
      type: Array,
      required: false,
      default: () => {
        return []
      }
    },
    inputClass: {
      type: String,
      required: false,
      default: ''
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    value: {
      type: String,
      required: false,
      default: ''
    },
    notifyChange: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      inputValue: '',
      results: [],
      isOpen: false,
      selectionCursor: -1
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        this.inputValue = newValue
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    onChange(evt) {
      if (this.notifyChange) {
        return this.changeResult(evt.target.value)
      }
    },
    onInput() {
      this.isOpen = true
      this.filterResults()
    },
    filterResults() {
      this.results = this.items.filter(
        item => item.toLowerCase().indexOf(this.inputValue.toLowerCase()) > -1
      )
    },
    setResult(result) {
      this.isOpen = false
      this.inputValue = result
      this.$emit('autocomplete::change', result)
      this.inputValue = ''
    },
    changeResult(result) {
      this.$emit('autocomplete::change', result)
      this.inputValue = ''
    },
    onArrowDown() {
      if (this.selectionCursor + 1 < this.results.length) {
        this.selectionCursor = this.selectionCursor + 1
      }
    },
    onArrowUp() {
      if (this.selectionCursor > 0) {
        this.selectionCursor = this.selectionCursor - 1
      }
    },
    onEnter() {
      this.setResult(this.results[this.selectionCursor])
      this.selectionCursor = -1
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false
        this.selectionCursor = -1
      }
    }
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss';

.Autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid variables.$dropdown-border-color;
  height: 120px;
  overflow: auto;
}

.Autocomplete-result.is-active {
  background-color: variables.$blue-color;
  color: white;
}

.Autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.Autocomplete-result:hover {
  background-color: variables.$blue-color;
  color: white;
}
</style>
