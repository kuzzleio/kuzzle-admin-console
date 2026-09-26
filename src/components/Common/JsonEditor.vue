<template>
  <div :id="id" :ref="id" :name="id" data-cy="JSONEditor" :class="classes" :style="style" />
</template>

<script>
import { nextTick } from 'vue';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/mode-json';

export default {
  name: 'JsonEditor',
  props: {
    content: String,
    id: {
      type: String,
      default: Date.now().toString() + Math.random().toString(),
    },
    myclass: {
      type: String,
      default: '',
    },
    readonly: Boolean,
    height: { type: Number, default: 250 },
  },
  emits: ['change'],
  setup() {
    ace.config.setModuleUrl(
      'ace/mode/json_worker',
      `https://cdn.jsdelivr.net/npm/ace-builds@${ace.version}/src-min-noconflict/worker-json.js`,
    );
  },
  data() {
    return {
      editor: null,
    };
  },
  computed: {
    classes() {
      return (this.readonly ? 'readonly ' : '') + this.myclass;
    },
    style() {
      if (this.height === undefined) {
        return { 'min-height': '250px' };
      } else {
        return { 'min-height': this.height + 'px!important' };
      }
    },
  },
  mounted() {
    nextTick(() => {
      /* eslint no-undef: 0 */
      this.editor = ace.edit(this.$refs[this.id], {
        mode: 'ace/mode/json',
      });
      this.editor.setTheme('ace/theme/tomorrow');
      this.editor.setFontSize(15);
      this.editor.getSession().setTabSize(2);
      this.editor.setReadOnly(this.readonly);
      this.editor.$blockScrolling = Infinity;
      this.setContent(this.content);

      // WARNING - Beware of update loops!
      // This event is triggered both when the content changes after
      // user interaction and when it is set programmatically.
      this.editor.on('change', () => {
        this.$emit('change', this.getRawValue());
      });
    });
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.removeAllListeners('change');
    }
  },
  methods: {
    getRawValue() {
      return this.editor.getValue();
    },
    getEditor() {
      return this.editor;
    },
    setContent(value) {
      nextTick(() => {
        this.editor.getSession().setValue(value);
      });
    },
  },
};
</script>

<style lang="scss" rel="stylesheet/scss">
.ace_text-input {
  position: relative;
}

// Lecture seule : fond Panel Grey et sélection Soft Sky, depuis les tokens.
.ace-tomorrow.ace_editor.readonly {
  background-color: var(--muted);
  .ace_gutter,
  .ace_active-line {
    background-color: var(--muted);
  }
  .ace_selection {
    background: var(--secondary);
  }
}
</style>
