<template>
  <input :id="name" type="text" name="collection" v-model="value" @input="updatePartial" />
  <label :for="name">{{name}}</label>
</template>

<script>
  import {setPartial} from '../../../vuex/modules/data/actions'

  export default {
    name: 'Mapping',
    props: {
      name: String,
      content: Object,
      fullName: String
    },
    data () {
      return {
        value: '',
        partial: {}
      }
    },
    methods: {
      updatePartial () {
        this.setPartial(this.fullName, this.value)
      }
    },
    vuex: {
      actions: {
        setPartial
      }
    },
    events: {
      'create-document' () {
//        let splitted = this.fullName.split('.')
//        splitted.reduce((prev, curr, index) => {
//          if (!splitted[index + 1]) {
//            prev[curr] = this.value
//          } else {
//            prev[curr] = {}
//          }
//          return prev[curr]
//        }, this.partial)
        // this.setPartial(this.fullName, this.value)
      }
    }
  }
</script>
