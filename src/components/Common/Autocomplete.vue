<template>
  <div>
    <input
      type="text"
      v-model="search"
      :class="inputClass"
      :placeholder="placeholder"
      @input="onInput"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter.prevent="onEnter"
    />

    <ul class="autocomplete-results" v-show="isOpen">
      <li
        v-for="(result, i) in results"
        :key="i"
        @click="setResult(result)"
        class="autocomplete-result"
        :class="{ 'is-active': i === arrowCounter }"
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
        default: () => ''
      },
      items: {
        type: Array,
        required: false,
        default: () => []
      },
      inputClass: {
        type: String,
        required: false,
        default: () => ''
      },
      placeholder: {
        type: String,
        required: false,
        default: () => ''
      }
    },
    data() {
      return {
        search: '',
        results: [],
        isOpen: false,
        arrowCounter: -1
      }
    },
    methods: {
      onInput() {
        this.isOpen = true
        this.filterResults()
      },
      filterResults() {
        this.results = this.items.filter(item => item.toLowerCase().indexOf(this.search.toLowerCase()) > -1)
      },
      setResult(result) {
        this.search = result
        this.isOpen = false
        this.$emit('change', result)
      },
      onArrowDown() {
        if (this.arrowCounter + 1 < this.results.length) {
          this.arrowCounter = this.arrowCounter + 1
        }
      },
      onArrowUp() {
        if (this.arrowCounter > 0) {
          this.arrowCounter = this.arrowCounter - 1
        }
      },
      onEnter() {
        this.setResult(this.results[this.arrowCounter])
        this.arrowCounter = -1
      },
      handleClickOutside(evt) {
        if (!this.$el.contains(evt.target)) {
          this.isOpen = false
          this.arrowCounter = -1
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

<style>
  .autocomplete-results {
    padding: 0;
    margin: 0;
    border: 1px solid #eeeeee;
    height: 120px;
    overflow: auto;
  }

  .autocomplete-result.is-active {
    background-color: #0397ef;
    color: white;
  }

  .autocomplete-result {
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
  }

  .autocomplete-result:hover {
    background-color: #0397ef;
    color: white;
  }
</style>
