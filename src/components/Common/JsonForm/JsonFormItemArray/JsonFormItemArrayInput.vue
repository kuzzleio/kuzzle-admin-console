<template>
  <div>
    <div
      v-for="(value, index) in valueItems"
      :key="index"
      @mouseover="showRemoveElement(index)"
      @mouseout="hideRemoveElement(index)"
      class="array-value input-field">

        <input
          :id="name"
          :type="type"
          step="0.1"
          number
          :v-model="valueItems[index]"/>

        <inline-actions
          :name="name"
          :full-name="fullName"
          :value-items="valueItems"
          :type="type"
          :index="index"
          :display="displayedLines[index]">
        </inline-actions>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .array-value {
    position: relative;
  }
</style>

<script>
  import InlineActions from './InlineActions'
  import Vue from 'vue'

  export default {
    name: 'JsonFormItemArrayInput',
    props: {
      name: String,
      fullName: String,
      valueItems: Array,
      type: String,
      displayedLines: []
    },
    components: {
      InlineActions
    },
    methods: {
      showRemoveElement (index) {
        Vue.set(this.displayedLines, index, true)
      },
      hideRemoveElement (index) {
        Vue.set(this.displayedLines, index, false)
      }
    },
    watch: {
      valueItems () {
        this.displayedLines = this.valueItems.map(() => false)
      }
    },
    mounted () {
      this.displayedLines = this.valueItems.map(() => false)
    }
  }
</script>
