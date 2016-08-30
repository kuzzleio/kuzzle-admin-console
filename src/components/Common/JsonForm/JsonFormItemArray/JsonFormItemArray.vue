<template>
  <div>
    <fieldset>
      {{name}}
      <div v-for="value in valueItems" track-by="$index" class="array-value">
        <input
          :id="name"
          type="text"
          v-model="value"/>

        <div class="inline-actions">
          <a
            class="btn-floating waves-effect waves-light btn-tiny red"
            @click="removeElementInArray($index)">
            <i class="fa fa-minus"></i>
          </a>
          <a
            v-if="$index === valueItems.length - 1"
            class="btn-floating waves-effect waves-light btn-tiny secondary"
            @click="addElementInArray">
            <i class="fa fa-plus"></i>
          </a>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss">
  .array-value {
    position: relative;
  }
</style>

<script>
  import { setPartial } from '../../../../vuex/modules/data/actions'

  export default {
    name: 'JsonFormItemArray',
    props: {
      name: String,
      content: Array,
      fullName: String
    },
    vuex: {
      actions: {
        setPartial
      }
    },
    data () {
      return {
        valueItems: [],
        partial: {},
        displayItems: []
      }
    },
    watch: {
      valueItems (v) {
        this.setPartial(this.fullName, [...v])
      },
      content () {
        this.valueItems = [...this.content]
      }
    },
    ready () {
      this.valueItems = [...this.content]
    },
    methods: {
      addElementInArray () {
        this.valueItems.$set(this.valueItems.length, null)
      },
      removeElementInArray (index) {
        if (this.valueItems.length === 1) {
          let splittedPath = this.fullName.split('.')
          splittedPath.pop()
          this.$dispatch('document-create::change-type-attribute', splittedPath.join('.'), this.name, 'string')
          return
        }

        this.valueItems.splice(index, 1)
      },
      setValue (e, index) {
        this.valueItems.$set(index, e.target.value)
      }
    }
  }
</script>
