<template>
  <div class="row input-field">
    <div class="row">
      <form class="col s12">
        <div class="row">
          <div class="input-field col s12">
            <textarea @input="update" :id="name" class="materialize-textarea">{{value}}</textarea>
            <label :for="name">{{name}}</label>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'JsonFormItemTextarea',
    props: {
      content: [String, Number],
      name: String,
      type: String,
      step: Number
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
      }
    },
    watch: {
      content (v) {
        this.value = v
      }
    }
  }
</script>
