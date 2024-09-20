<template>
  <form @submit.prevent="create">
    <!-- Json view -->
    <div class="row json-view">
      <div class="col s6 card">
        <div class="card-content">
          <span class="card-title">Credentials</span>
          <json-editor
            :id="idContent"
            ref="jsoneditor"
            class="document-json"
            :content="jsonDocument"
            :height="300"
            @changed="jsonChanged"
          />
        </div>
      </div>

      <!-- Fields -->
      <div class="col s6 card">
        <div class="card-content">
          <span class="card-title">Fields</span>
          <json-editor
            :id="idMapping"
            class="document-json"
            :content="mapping"
            :readonly="true"
            :height="300"
          />
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  name: 'DocumentCreateOrUpdate',
  components: {
    JsonEditor,
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mapping: [Object, Array],
    idContent: {
      type: String,
      default: 'content',
    },
    idMapping: {
      type: String,
      default: 'mapping',
    },
  },
  data() {
    return {
      jsonDocument: {},
    };
  },
  mounted() {
    this.jsonDocument = this.value || {};
  },
  methods: {
    jsonChanged(json) {
      this.$emit('input', json);
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.input-id {
  margin-bottom: 0;
}
.error {
  position: relative;
  padding: 8px 12px;
  margin: 0;
}
.dismiss-error {
  position: absolute;
  right: 10px;
  cursor: pointer;
  padding: 3px;
  border-radius: 2px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}
</style>
