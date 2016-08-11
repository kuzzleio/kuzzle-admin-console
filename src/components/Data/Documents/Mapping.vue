<template>
  <fieldset v-if="isNested(content)">
    <legend>{{name}}</legend>
    <div v-for="(nestedName, nestedContent) in content.properties">
      <mapping :name="nestedName" :full-name-input="path" :content="nestedContent"></mapping>
    </div>
  </fieldset>
  <div v-if="!isNested(content)" class="input-field">
    <mapping-value :name="name" :full-name="path" :content="content"></mapping-value>
  </div>
</template>

<script>
  import MappingValue from './MappingValue'

  export default {
    name: 'Mapping',
    components: {
      MappingValue
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
      }
    }
  }
</script>
