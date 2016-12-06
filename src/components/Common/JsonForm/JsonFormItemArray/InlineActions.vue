<template>
  <div class="inline-actions">
    <a
      v-if="index === valueItems.length - 1"
      class="btn-floating waves-effect waves-light btn-tiny secondary"
      @click="addElementInArray">
      <i class="fa fa-plus"></i>
    </a>
    <a
      class="btn-floating waves-effect waves-light btn-tiny red-color"
      @click="removeElementInArray"
      v-show="display"
      >
      <i class="fa fa-minus"></i>
    </a>
  </div>
</template>

<script>
  export default {
    name: 'InlineActions',
    props: {
      valueItems: Array,
      fullName: String,
      name: String,
      type: String,
      index: Number,
      display: Boolean
    },
    methods: {
      addElementInArray () {
        this.$dispatch('json-form-item-array::add-element')
      },
      removeElementInArray () {
        if (this.valueItems.length === 1) {
          let splittedPath = this.fullName.split('.')
          splittedPath.pop()
          this.$dispatch('document-create::change-type-attribute', splittedPath.join('.'), this.name, this.type, this.valueItems[0])
          return
        }

        this.$dispatch('json-form-item-array::remove-element', this.index)
      }
    }
  }
</script>