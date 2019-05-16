<template>
  <div class="Autocomplete">
    <input
      type="text"
      v-model="inputValue"
      :class="inputClass"
      :placeholder="placeholder"
      @input="onInput"
      @change="evt => { if (this.notifyChange) { return changeResult(evt.target.value)}}"
      @focus="onInput"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter.prevent="onEnter"
    />

    <ul class="Autocomplete-results" v-show="isOpen">
      <li
        v-for="(result, i) in results"
        class="Autocomplete-result"
        :key="result"
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
  name: 'autocomplete',
  props: {
    item: {
      type: String,
      required: false,
      default: ''
    },
    items: {
      type: Array,
      required: false,
      default: []
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
  methods: {
    onInput() {
      if (this.results.length >= 0) {
        this.isOpen = true
      }
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
  }
}
</script>

<style scoped lang="scss">
.Autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid $dropdown-border-color;
  height: 120px;
  overflow: auto;
}

.Autocomplete-result.is-active {
  background-color: $blue-color;
  color: white;
}

.Autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.Autocomplete-result:hover {
  background-color: $blue-color;
  color: white;
}
</style>
