<template>
  <!-- For nested objects -->
  <fieldset v-if="isNested(content)">
    <legend>
      {{name}}
      <a class="btn-floating waves-effect waves-light btn-tiny secondary" @click="addAttribute"><i class="fa fa-plus"></i></a>
    </legend>
    <div v-for="(nestedName, nestedContent) in content.properties">
      <json-form :name="nestedName" :full-name-input="path" :content="nestedContent"></json-form>
    </div>
  </fieldset>

  <!-- Root attributes -->
  <div v-if="!isNested(content)" class="input-field">
    <component :is="componentItem" :name="name" :full-name="path" :content="content.val"></component>
  </div>
</template>

<script>
  import JsonFormItemCheckbox from './JsonFormItemCheckbox'
  import JsonFormItemNumber from './JsonFormItemNumber'
  import JsonFormItemText from './JsonFormItemText'

  export default {
    name: 'JsonForm',
    components: {
      JsonFormItemCheckbox,
      JsonFormItemNumber,
      JsonFormItemText
    },
    computed: {
      path () {
        if (this.fullNameInput) {
          return this.fullNameInput + '.' + this.name
        }
        return this.name
      },
      componentItem () {
        switch (this.content.type) {
          case 'boolean':
            return 'JsonFormItemCheckbox'
          case 'integer':
          case 'long':
          case 'short':
          case 'byte':
          case 'double':
          case 'float':
            return 'JsonFormItemNumber'
          default:
            return 'JsonFormItemText'
        }
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
        this.$dispatch('document-create::add-attribute', this.path)
      }
    }
  }
</script>
