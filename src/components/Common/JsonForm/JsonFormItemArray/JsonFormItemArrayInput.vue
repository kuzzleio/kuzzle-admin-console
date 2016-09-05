<template>
  <div>
    <div
      v-for="value in valueItems"
      track-by="$index"
      @mouseover="showRemoveElement($index)"
      @mouseout="hideRemoveElement($index)"
      class="array-value input-field">

        <input
          :id="name"
          :type="type"
          step="0.1"
          number
          v-model="value"/>

        <inline-actions
          :name="name"
          :full-name="fullName"
          :value-items="valueItems"
          :type="type"
          :index="$index"
          :display="displayedLines[$index]">
        </inline-actions>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss">
  .array-value {
    position: relative;
  }
</style>

<script>
  import InlineActions from './InlineActions'

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
        this.displayedLines.$set(index, true)
      },
      hideRemoveElement (index) {
        this.displayedLines.$set(index, false)
      }
    },
    watch: {
      valueItems () {
        this.displayedLines = this.valueItems.map(() => false)
      }
    },
    ready () {
      this.displayedLines = this.valueItems.map(() => false)
    }
  }
</script>
