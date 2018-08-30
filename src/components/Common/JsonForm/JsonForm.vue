<template>
  <div  v-if="Object.keys(schema).length">
    <div class="json-form" v-for="(content, name) in schema" :key="name">
      <!-- For nested objects -->
      <fieldset v-if="isNested(content)">
        <legend>
          {{name}}
        </legend>
        <json-form :schema="content.properties" :parent="name" :document="document" @update-value="updateNested"></json-form>
      </fieldset>

      <!-- Root attributes -->
      <div class="input-field" v-else>
        <component :is="componentItem(content)" ref="myRef" :name="name" @json-changed="update" :content="document" :parent="parent" :type="content.type" :step="content.step" :schema="content" @update-value="update" :mapping="$store.state.collection.mapping"></component>
      </div>
    </div>
  </div>
  <p v-else>
    Current collection has no mapping specified. You can specify it by editing its properties.
  </p>
</template>

<script>
import JsonFormItemInput from './JsonFormItemInput'
import JsonFormItemCheckbox from './JsonFormItemCheckbox'
import JsonFormItemJson from './JsonFormItemJson'
import JsonFormItemGeopoint from './JsonFormItemGeopoint'
import JsonFormItemTextarea from './JsonFormItemTextarea'
import JsonFormItemRichEditor from './JsonFormItemRichEditor'
import JsonFormItemSelect from './JsonFormItemSelect'
import JsonFormItemMultiSelect from './JsonFormItemMultiSelect'

export default {
  name: 'JsonForm',
  components: {
    JsonFormItemInput,
    JsonFormItemCheckbox,
    JsonFormItemJson,
    JsonFormItemGeopoint,
    JsonFormItemTextarea,
    JsonFormItemSelect,
    JsonFormItemMultiSelect,
    JsonFormItemRichEditor
  },
  props: {
    schema: [Object, Array],
    document: Object,
    parent: String
  },
  methods: {
    isNested(content) {
      return content.properties && Object.keys(content.properties).length
    },
    componentItem(content) {
      switch (content.tag) {
        case 'input':
          return 'JsonFormItemInput'
        case 'checkbox':
        case 'boolean':
          return 'JsonFormItemCheckbox'
        case 'geo-point':
          return 'JsonFormItemGeopoint'
        case 'textarea':
          return 'JsonFormItemTextarea'
        case 'select':
          return 'JsonFormItemSelect'
        case 'mselect':
          return 'JsonFormItemMultiSelect'
        case 'rich-text':
          return 'JsonFormItemRichEditor'
        default:
          return 'JsonFormItemJson'
      }
    },
    update(content) {
      this.$emit('update-value', {
        name: content.name,
        value: content.value,
        parent: this.parent
      })
    },
    updateNested(content) {
      this.$emit('update-value', {
        name: content.parent,
        value: {
          ...this.document[content.parent],
          [content.name]: content.value
        }
      })
    }
  }
}
</script>


<style lang="scss" rel="stylesheet/scss">
.pre_ace,
.ace_editor {
  height: 100px;
}
.json-form {
  legend {
    border: 0;
    padding: 0;
    font-weight: 300;
    left: -4px;
    position: absolute;
    top: -27px;
    font-family: 'Roboto', Arial, sans-serif;

    i.fa {
      font-size: 1.2em;
      cursor: pointer;
      margin-left: 5px;
    }
  }
  fieldset {
    border: 0;
    border-left: solid 3px #eee;
    position: relative;
    margin: 45px 0 15px 0;
    padding: 0 0 0 1em;
    &:hover,
    &:focus,
    &.active {
      border-left: solid 3px #ddd;
    }
  }

  .list-fields {
    margin-top: 25px;
  }

  .input-field {
    padding-right: 80px;
    input {
      margin-bottom: 10px;
    }
    .select-wrapper + label {
      top: -14px;
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
