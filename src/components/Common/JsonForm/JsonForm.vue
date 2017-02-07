<template>
  <div>
    <div class="json-form" v-for="(content, name) in schema">
      <!-- For nested objects -->
      <fieldset v-if="isNested(content)">
        <legend>
          {{name}}
        </legend>
        <div v-for="(nestedContent, nestedName) in content.elements">
          <json-form :schema="content.elements" :parent="name" :document="document"></json-form>
        </div>
      </fieldset>

      <!-- Root attributes -->
      <div class="input-field" v-else>
        <component :is="componentItem(content)" :name="name" :content="content.val" :type="content.type" :step="content.step" :schema="content.elements" @update-value="update"></component>
      </div>
    </div>
  </div>
</template>

<script>
  import JsonFormItemCheckbox from './JsonFormItemCheckbox'
  import JsonFormItemNumber from './JsonFormItemNumber'
  import JsonFormItemText from './JsonFormItemText'
  import JsonFormItemArray from './JsonFormItemArray/JsonFormItemArray'
  import JsonFormItemProfileIds from './JsonFormItemProfileIds'
  import JsonFormItemGeoPoint from './JsonFormItemGeoPoint'
  import JsonFormItemInput from './JsonFormItemInput'

  import Vue from 'vue'

  export default {
    name: 'JsonForm',
    components: {
      JsonFormItemCheckbox,
      JsonFormItemNumber,
      JsonFormItemText,
      JsonFormItemArray,
      JsonFormItemProfileIds,
      JsonFormItemGeoPoint,
      JsonFormItemInput
    },
    props: {
      schema: [Object, Array],
      document: Object,
      parent: String
    },
    methods: {
      isNested (content) {
        return content.elements && Object.keys(content.elements).length
      },
      componentItem (content) {
        switch (content.tag) {
          case 'input':
            return 'JsonFormItemInput'
          case 'checkbox':
          case 'boolean':
            return 'JsonFormItemCheckbox'
          default:
            return 'JsonFormItemInput'
        }
      },
      update (content) {
        if (this.parent) {
          Vue.set(this.document, this.parent, {[content.name]: content.value})
        } else {
          Vue.set(this.document, content.name, content.value)
          this.$emit('update-value', {name: content.name, value: content.value})
        }
      }
    }
  }
</script>


<style lang="scss" rel="stylesheet/scss">
  .json-form {
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
      border: 0;
      border-left: solid 3px #EEE;
      position: relative;
      margin: 45px 0 15px 0;
      padding: 0 0 0 1em;
      &:hover, &:focus, &.active {
        border-left: solid 3px #DDD;
      }
    }

    .list-fields {
      margin-top: 25px;
    }

    .input-field {
      padding-right: 80px;
      input {
        height: 2rem;
        margin-bottom: 10px;
      }
      .select-wrapper + label {
        top: -14px
      }
      .select-wrapper input.select-dropdown {
        border-bottom: 1px solid #e4e1e1;
      }
      label {
        top: 0.4rem;
        &.active {
          transform: translateY(-120%);
        }
      }
      .inline-actions {
        position: absolute;
        right: 80px;
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
  }
</style>
