<template>
  <div :id="id" :ref="id" :name="id" data-cy="JSONEditor" :class="classes" :style="style" />
</template>

<script>
import { nextTick } from 'vue';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/mode-json';

import { useTheme } from '@/composables/useTheme';

// Thème d'Ace selon celui de la console (ADR-0056) : la même famille, pour
// que la coloration du JSON ne change pas de sens d'un thème à l'autre.
const aceTheme = (isDark) => (isDark ? 'ace/theme/tomorrow_night' : 'ace/theme/tomorrow');

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
    /*
     * Raccourcis que l'éditeur rend au parent : `{ run: { win: 'Ctrl-Enter',
     * mac: 'Command-Enter' } }` émet `shortcut` avec `'run'`. Ace traite les
     * combinaisons à modificateur avant qu'elles ne remontent le DOM : un
     * `@keydown` posé sur un ancêtre ne les voit pas. Déclarées ici comme
     * commandes Ace, elles passent par lui.
     */
    shortcuts: { type: Object, default: () => ({}) },
  },
  emits: ['change', 'shortcut'],
  setup() {
    const { isDark } = useTheme();
    ace.config.setModuleUrl(
      'ace/mode/json_worker',
      `https://cdn.jsdelivr.net/npm/ace-builds@${ace.version}/src-min-noconflict/worker-json.js`,
    );
    return { isDark };
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
      // `enableKeyboardAccessibility` : sans lui, Tab indente et le focus ne
      // sort plus de l'éditeur au clavier (WCAG 2.1.2, audit de la DA).
      this.editor = ace.edit(this.$refs[this.id], {
        enableKeyboardAccessibility: true,
        mode: 'ace/mode/json',
      });
      this.editor.textInput.getElement().setAttribute('aria-label', 'JSON editor');
      this.editor.setTheme(aceTheme(this.isDark));
      this.editor.setFontSize(15);
      this.editor.getSession().setTabSize(2);
      this.editor.setReadOnly(this.readonly);
      this.editor.$blockScrolling = Infinity;
      this.setContent(this.content);

      for (const [name, bindKey] of Object.entries(this.shortcuts)) {
        this.editor.commands.addCommand({
          name,
          bindKey,
          exec: () => this.$emit('shortcut', name),
        });
      }

      // WARNING - Beware of update loops!
      // This event is triggered both when the content changes after
      // user interaction and when it is set programmatically.
      this.editor.on('change', () => {
        this.$emit('change', this.getRawValue());
      });
    });
  },
  watch: {
    isDark(value) {
      this.editor?.setTheme(aceTheme(value));
    },
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

// Sombre : les surfaces de la console plutôt que le gris neutre du thème.
.ace-tomorrow-night.ace_editor {
  background-color: var(--card);
  .ace_gutter {
    background-color: var(--subtle);
  }
}

// Lecture seule : fond Panel Grey et sélection Soft Sky, depuis les tokens.
.ace-tomorrow.ace_editor.readonly,
.ace-tomorrow-night.ace_editor.readonly {
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
