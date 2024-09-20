<template>
  <div class="row collection-form-line valign-wrapper" :class="{ odd: index % 2 === 0 }">
    <p class="col s3 attribute-title truncate">
      {{ name }}
    </p>
    <div class="col s4 attribute-type">
      <div class="">
        <m-select :value="value.id" :options="optionsForAttribute" @input="changeSchema">
          <option v-for="option in optionsForAttribute" :key="option.id" :value="option.id">
            {{ option.name }}
          </option>
        </m-select>
      </div>
    </div>
    <i
      v-if="type === 'force-json'"
      title="This object has too many levels, the view json is forced for this attribute."
      class="fa fa-question-circle info"
    />
    <div v-if="chooseValues" class="col s4">
      <multiselect
        :options="[]"
        :taggable="true"
        tag-placeholder="Add this as new value."
        :value="values"
        :multiple="true"
        @tag="addValue"
        @remove="removeValue"
      />
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import {} from 'vue-multiselect/dist/vue-multiselect.min.css';

import MSelect from '../MSelect.vue';
import {
  getSchemaForType,
  getElementDefinition,
  castByElementId,
} from '@/services/collectionHelper';

export default {
  name: 'CollectionFormLine',
  components: {
    Multiselect,
    MSelect,
  },
  props: {
    name: String,
    type: String,
    index: Number,
    value: Object,
    values: Array,
    chooseValues: Boolean,
  },
  data() {
    return {
      elementDefinition: { ...this.value },
    };
  },
  computed: {
    optionsForAttribute() {
      return getSchemaForType(this.type);
    },
    placeholder() {
      return `${this.name} values (${this.type} only)`;
    },
  },
  methods: {
    changeSchema(element) {
      this.elementDefinition = getElementDefinition(element);
      if (!this.elementDefinition) {
        return;
      }

      const elementDefinition = { ...this.elementDefinition };
      if (elementDefinition.chooseValues) {
        elementDefinition.values = this.values || [];
      }
      this.$emit('input', { name: this.name, element: elementDefinition });
    },
    addValue(value) {
      const castValue = castByElementId(this.elementDefinition.id, value);

      if (!castValue) {
        return;
      }

      const _values = this.values ? [...this.values] : [];

      if (_values.some((value) => value === castValue)) {
        return;
      }

      this.$emit('input', {
        name: this.name,
        element: {
          ...this.elementDefinition,
          values: _values.concat([castValue]),
        },
      });
    },
    removeValue(removedValue) {
      const castValue = castByElementId(this.elementDefinition.id, removedValue);

      if (!castValue) {
        return;
      }

      const _values = this.values.filter((value) => value !== castValue);
      this.$emit('input', {
        name: this.name,
        element: { ...this.elementDefinition, values: _values },
      });
    },
  },
};
</script>
