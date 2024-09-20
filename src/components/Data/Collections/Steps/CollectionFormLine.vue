<template>
  <div class="CollectionFormLine row valign-wrapper" :class="{ odd: index % 2 === 0 }">
    <div class="CollectionFormLine-name col s3 attribute-title truncate">
      {{ name }} <code>(type: {{ type }})</code>
    </div>
    <div class="col s3 attribute-type">
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
    <div class="col s6">
      <multiselect
        v-if="chooseValues"
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

import {
  getSchemaForType,
  getElementDefinition,
  castByElementId,
} from '@/services/collectionHelper';

import MSelect from '@/components/Common/MSelect.vue';

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

<style lang="scss">
.CollectionFormLine-name {
  padding: 10px;
  margin-bottom: 0;

  &.odd {
    background-color: #f4f4f4;

    .multiselect__tags {
      background-color: #fff !important;
    }
  }
  code {
    font-size: 0.8em;
    color: $disabled-color;
  }

  .info {
    margin-left: 5px;
    cursor: pointer;
    font-size: 1.1em;
    color: $lavandia-color;
  }

  .select-wrapper {
    margin-top: 5px;
    span.caret {
      top: 10px;
    }
    input.select-dropdown {
      height: 2rem;
    }
  }

  .multiselect {
    margin-top: 5px;
    margin-left: 10px;
    margin-bottom: 5px;
    input {
      height: 0;
    }
    .multiselect__select {
      display: none;
    }
    .multiselect__input,
    .multiselect__input:focus {
      border-bottom: 0;
    }

    .multiselect__input {
      margin-bottom: 0;
    }
    .multiselect__tags {
      background-color: #fbfbfb;
      span {
        background-color: $blue-color;
      }
    }
  }
  .attribute-title,
  .attribute-type {
    margin-left: 0;
  }
}
</style>
