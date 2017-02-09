<template>
  <div class="row collection-form-line" :class="{odd: (index % 2) === 0}">
    <p class="col s3 truncate">{{name}}</p>
    <div class="col s4">
      <m-select :value="value.id" @input="changeSchema" :options="optionsForAttribute">
        <option v-for="option in optionsForAttribute" :key="option.id" :value="option.id">{{option.name}}</option>
      </m-select>
    </div>
    <i
      class="fa fa-question-circle info"
      v-if="type === 'force-json'"
      v-title="{active: true, position: 'bottom', title: 'This object has too many levels, the view json is forced for this attribute.'}">
    </i>
    <div class="col s4" v-if="chooseValues">
      <multiselect
        :options="[]"
        :taggable="true"
        tag-placeholder="Add this as new value."
        :placeholder="placeholder"
        @tag="addValue"
        @remove="removeValue"
        :value="values"
        :multiple="true">
      </multiselect>
    </div>
  </div>
</template>

<script>
  import {getSchemaForType, getElementDefinition, castByElementId} from '../../../../services/collectionHelper'
  import Multiselect from 'vue-multiselect'
  import MSelect from '../../../Common/MSelect'
  import title from '../../../../directives/title.directive'

  export default {
    name: 'CollectionFormLine',
    props: {
      name: String,
      type: String,
      index: Number,
      value: Object
    },
    components: {
      Multiselect,
      MSelect
    },
    directives: {
      title
    },
    data () {
      return {
        chooseValues: false,
        values: [],
        elementDefinition: {...this.value}
      }
    },
    computed: {
      optionsForAttribute () {
        return getSchemaForType(this.type)
      },
      placeholder () {
        return `${this.name} values (${this.type} only)`
      }
    },
    methods: {
      changeSchema (element) {
        this.elementDefinition = getElementDefinition(element)
        if (!this.elementDefinition) {
          return
        }

        this.chooseValues = this.elementDefinition.chooseValues
        this.$emit('input', {...this.elementDefinition})
      },
      addValue (value) {
        let castValue = castByElementId(this.elementDefinition.id, value)

        if (!castValue) {
          return
        }

        if (this.values.some(value => value === castValue)) {
          return
        }

        this.values.push(castValue)
        this.$emit('input', {...this.elementDefinition, values: this.values})
      },
      removeValue (removedValue) {
        let castValue = castByElementId(this.elementDefinition.id, removedValue)

        if (!castValue) {
          return
        }

        this.values = this.values.filter(value => value !== castValue)
        this.$emit('input', {...this.elementDefinition, values: this.values})
      }
    },
    watch: {
      value () {
        this.elementDefinition = {...this.value}
        this.chooseValues = this.elementDefinition.chooseValues

        if (this.value.values && this.value.values.length) {
          this.values = [...this.value.values]
        } else {
          this.values = []
        }
      }
    }
  }
</script>