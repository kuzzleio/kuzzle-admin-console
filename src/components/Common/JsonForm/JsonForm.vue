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
    <component :is="componentItem" :name="name" :full-name="path" :content="content.val"></component>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss">
  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
    legend {
      border: 0;
      padding: 0;
      font-weight: 300;
      left: -4px;
      position: absolute;
      top: -27px;
      font-family: "Roboto", Arial, sans-serif;

      i.fa {
        font-size: 1.2em;
        cursor: pointer;
        margin-left: 5px;
      }
    }
    fieldset {
      border-left: solid 3px #EEE;
      position: relative;
      margin: 45px 0 15px 0;
      padding: 0 0 0 1em;
      &:hover, &:focus, &.active {
        border-left: solid 3px #DDD;
      }
    }
  }

  .list-fields {
    margin-top: 25px;
  }

  .input-field {
    input {
      height: 2rem;
      margin-bottom: 10px;
    }
    .select-wrapper + label {
      top: -14px
    }
    label {
      top: 0.4rem;
      &.active {
        transform: translateY(-120%);
      }
    }
    .inline-actions {
      position: absolute;
      right: 0;
      top: 0;
      -webkit-transform: translateX(110%);
      transform: translateX(110%);
      a.btn-tiny {
        height: 30px;
        padding: 0;
        width: 30px;
        i {
          font-size: 1rem;
          line-height: 32px;
        }
      }
    }
  }
</style>

<script>
  import JsonFormItemCheckbox from './JsonFormItemCheckbox'
  import JsonFormItemNumber from './JsonFormItemNumber'
  import JsonFormItemText from './JsonFormItemText'
  import JsonFormItemArray from './JsonFormItemArray/JsonFormItemArray'

  export default {
    name: 'JsonForm',
    components: {
      JsonFormItemCheckbox,
      JsonFormItemNumber,
      JsonFormItemText,
      JsonFormItemArray
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
          case 'number':
            return 'JsonFormItemNumber'
          case 'array':
            return 'JsonFormItemArray'
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
