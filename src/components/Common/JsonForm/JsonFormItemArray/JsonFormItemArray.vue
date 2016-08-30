<template>
  <div>
    <fieldset>
      {{name}}
      <div v-for="value in valueItems">
        <input
          :id="name"
          type="text"
          v-model="value"/>

        <a
          v-if="$index === content.length - 1"
          class="btn-floating waves-effect waves-light btn-tiny secondary right"
          @click="addElementInArray">
          <i class="fa fa-plus"></i>
        </a>
      </div>
    </fieldset>
  </div>
</template>

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

      },
      setValue (e, index) {
        this.valueItems.$set(index, e.target.value)
      }
    }
  }
</script>
