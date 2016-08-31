<template>
  <div>
    <div v-for="value in valueItems" track-by="$index" class="array-value">
      <input
        :id="name"
        type="number"
        step="0.1"
        v-model="value"/>

      <inline-actions
        :name="name"
        :full-name="fullName"
        :value-items="valueItems"
        type="number"
        :index="$index"
      ></inline-actions>
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
    name: 'JsonFormItemArrayNumber',
    props: {
      name: String,
      fullName: String,
      valueItems: Array
    },
    components: {
      InlineActions
    }
  }
</script>
