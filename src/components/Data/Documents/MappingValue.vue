<template>
  <input :id="name" type="text" name="collection" v-model="value"/>
  <label :for="name">{{name}}</label>
</template>

<script>
  import {createDocument} from '../../../vuex/modules/data/actions'

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
    vuex: {
      actions: {
        createDocument
      }
    },
    events: {
      'create-document' () {
        let splitted = this.fullName.split('.')
        splitted.reduce((prev, curr, index) => {
          if (!splitted[index + 1]) {
            prev[curr] = this.value
          } else {
            prev[curr] = {}
          }
          return prev[curr]
        }, this.partial)
        this.createDocument(this.partial)
      }
    }
  }
</script>
