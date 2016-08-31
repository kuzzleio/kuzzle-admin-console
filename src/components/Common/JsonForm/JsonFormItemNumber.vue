<template>
  <div class="row input-field">
    <input :id="name" type="number" :value="content" v-model="value" step="0.1" @focus="display = true" @blur="hideAttribute" />
    <label :for="name" :class="{'active': value}">{{name}}</label>

    <div class="inline-actions">
      <a
        class="btn-floating waves-effect waves-light btn-tiny secondary right"
        v-show="display"
        @click="transformToArray">
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
      transformToArray () {
        let splittedPath = this.fullName.split('.')
        splittedPath.pop()
        let value = [null]

        if (this.value) {
          value = [this.value, null]
        }

        this.$dispatch('document-create::change-type-attribute', splittedPath.join('.'), this.name, 'array', value)
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
