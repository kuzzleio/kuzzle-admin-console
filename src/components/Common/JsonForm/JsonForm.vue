<template>
  <!-- For nested objects -->
  <fieldset v-if="isNested(content)">
    <legend>
      {{name}}
      <i @click="addAttribute"class="fa fa-plus-circle primary"></i>
    </legend>
    <div v-for="(nestedName, nestedContent) in content.properties">
      <json-form :name="nestedName" :full-name-input="path" :content="nestedContent"></json-form>
    </div>
  </fieldset>

  <!-- Root attributes -->
  <div v-if="!isNested(content)" class="input-field">
    <component :is="getComponentItem()" :name="name" :full-name="path" :content="content.val"></component>
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
      },
      getComponentItem () {
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
    }
  }
</script>
