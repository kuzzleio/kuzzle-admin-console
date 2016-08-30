<template>
  <div class="row input-field">
    <input :id="name" type="text" :value="content" v-model="value" @focus="display = true" @blur="hideAttribute"/>
    <label :for="name" :class="{'active': value}">{{name}}</label>

    <a
      class="btn-floating waves-effect waves-light btn-tiny secondary right"
      v-show="display"
      @click="addArray">
      <i class="fa fa-plus"></i>
    </a>
  </div>
</template>

<script>
  import {setPartial} from '../../../vuex/modules/data/actions'

  export default{
    name: 'JsonFormItemText',
    props: {
      content: String,
      name: String,
      fullName: String
    },
    data () {
      return {
        value: '',
        display: false
      }
    },
    watch: {
      value (v) {
        this.setPartial(this.fullName, v)
      }
    },
    methods: {
      hideAttribute () {
        setTimeout(() => {
          this.display = false
        }, 100)
      },
      addArray () {

      }
    },
    vuex: {
      actions: {
        setPartial
      }
    }
  }
</script>
