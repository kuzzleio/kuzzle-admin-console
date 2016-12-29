<template>
  <div class="row input-field">
    <input :id="fullName" type="number" :value="content" v-model="value" :step="step" @focus="display = true" @blur="hideAttribute" number/>
    <label :for="fullName" :class="{'active': value}">{{name}}</label>

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
  import {SET_PARTIAL_TO_DOCUMENT} from '../../../vuex/modules/data/mutation-types'

  export default {
    name: 'JsonFormItemNumber',
    props: {
      content: Number,
      name: String,
      type: String,
      fullName: String
    },
    data () {
      return {
        value: null,
        display: false
      }
    },
    computed: {
      step () {
        return this.type === 'float' ? '0.1' : '1'
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

        this.$emit('document-create::change-type-attribute', splittedPath.join('.'), this.name, 'array', value)
      }
    },
    watch: {
      value (v) {
        this.$store.commit(SET_PARTIAL_TO_DOCUMENT, {path: this.fullName, value: v})
      },
      content (v) {
        this.value = v
      }
    }
  }
</script>
