<template>
  <div class="row input-field">
    <input :id="name" type="number" :value="content" v-model="value" step="0.1" @focus="display = true" @blur="hideAttribute" />
    <label :for="name" :class="{'active': value}">{{name}}</label>

    <div class="inline-actions">
      <a
        class="btn-floating waves-effect waves-light btn-tiny secondary right"
        v-show="display"
        @click="addArray">
        <i class="fa fa-plus"></i>
      </a>
    </div>
  </div>
</template>

<script>
  import {setPartial} from '../../../vuex/modules/data/actions'

  export default{
    name: 'JsonFormItemNumber',
    props: {
      content: Number,
      name: String,
      fullName: String
    },
    data () {
      return {
        value: null,
        display: false
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
    watch: {
      value (v) {
        this.setPartial(this.fullName, v)
      }
    },
    vuex: {
      actions: {
        setPartial
      }
    }
  }
</script>
