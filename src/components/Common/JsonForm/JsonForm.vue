<template>
  <!-- For nested objects -->
  <fieldset v-if="isNested(content)">
    <legend>{{name}}</legend>
    <div class="row">
      <a class="btn btn-small right" @click="addAttribute"><i class="fa fa-plus-circle left"></i>new attribute</a>
    </div>
    <div v-for="(nestedName, nestedContent) in content.properties">
      <json-form :name="nestedName" :full-name-input="path" :content="nestedContent"></json-form>
    </div>
  </fieldset>

  <!-- Root attributes -->
  <div v-if="!isNested(content)" class="input-field">
    <json-form-item :name="name" :full-name="path" :content="content"></json-form-item>
  </div>
</template>

<script>
  import JsonFormItem from './JsonFormItem'

  export default {
    name: 'JsonForm',
    components: {
      JsonFormItem
    },
    computed: {
      path () {
        if (this.fullNameInput) {
          return this.fullNameInput + '.' + this.name
        }
        return this.name
      }
    },
    props: {
      name: String,
      content: Object,
      fullNameInput: String
    },
    methods: {
      isNested (content) {
        return !!content.properties
      },
      addAttribute () {
        // todo format
        this.$dispatch('add-attribute', this.path)
      }
    }
  }
</script>
