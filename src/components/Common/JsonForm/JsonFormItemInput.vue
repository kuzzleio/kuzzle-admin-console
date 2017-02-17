<template>
  <div class="row input-field">
    <input :type="type" :value="value" @input="update" :step="step" @focus="display = true"/>
    <label :class="{'active': value !== n}">{{name}}</label>
  </div>
</template>

<script>
  export default {
    name: 'JsonFormItemInput',
    props: {
      content: [Object, String, Number],
      name: String,
      type: String,
      step: Number,
      parent: String
    },
    data () {
      return {
        value: '',
        display: false
      }
    },
    methods: {
      update (e) {
        this.$emit('update-value', {name: this.name, value: e.target.value})
      },
      initValue () {
        if (!Object.keys(this.content).length) {
          return
        }

        if (this.parent) {
          if (this.content[this.parent] && this.content[this.parent][this.name]) {
            this.value = this.content[this.parent][this.name]
          }
        } else {
          this.value = this.content[this.name]
        }
      }
    },
    mounted () {
      this.initValue()
    },
    watch: {
      content: 'initValue'
    }
  }
</script>
