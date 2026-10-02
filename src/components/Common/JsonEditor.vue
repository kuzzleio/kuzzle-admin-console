<template>
  <div :id="id" ref="editorEl" :name="id" data-cy="JSONEditor" :class="classes" :style="style" />
</template>

<script lang="ts">
// Calculé une fois, au chargement du module, comme l'était le `default` de
// l'option `props` : les instances sans `id` partagent la même valeur. Dans un
// bloc à part : `defineProps` est hissé hors de `setup()` et ne peut pas lire
// une variable du `<script setup>` (G-107).
const DEFAULT_ID = Date.now().toString() + Math.random().toString();
</script>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/mode-json';
import jsonWorkerUrl from 'ace-builds/src-noconflict/worker-json?url';

import { useTheme } from '@/composables/useTheme';

// Thème d'Ace selon celui de la console (ADR-0056) : la même famille, pour
// que la coloration du JSON ne change pas de sens d'un thème à l'autre.
const aceTheme = (isDark: boolean): string =>
  isDark ? 'ace/theme/tomorrow_night' : 'ace/theme/tomorrow';

const props = withDefaults(
  defineProps<{
    content?: string;
    height?: number;
    id?: string;
    myclass?: string;
    readonly?: boolean;
    /*
     * Raccourcis que l'éditeur rend au parent : `{ run: { win: 'Ctrl-Enter',
     * mac: 'Command-Enter' } }` émet `shortcut` avec `'run'`. Ace traite les
     * combinaisons à modificateur avant qu'elles ne remontent le DOM : un
     * `@keydown` posé sur un ancêtre ne les voit pas. Déclarées ici comme
     * commandes Ace, elles passent par lui.
     */
    shortcuts?: Record<string, { mac: string; win: string }>;
  }>(),
  {
    content: undefined,
    height: 250,
    id: DEFAULT_ID,
    myclass: '',
    readonly: false,
    shortcuts: () => ({}),
  },
);

const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'shortcut', name: string): void;
}>();

const { isDark } = useTheme();
// Le worker de validation du JSON est servi par la console, comme le reste
// d'Ace : il venait de cdn.jsdelivr.net, un script tiers que la CSP aurait dû
// autoriser (ADR-0065). Chargé directement et non par un `Blob` qui
// l'importerait, il n'a besoin que de `worker-src 'self'`.
ace.config.set('loadWorkerFromBlob', false);
ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl);

const editorEl = useTemplateRef<HTMLDivElement>('editorEl');
// `shallowRef` : l'éditeur d'Ace est un objet tiers, que Vue n'a pas à rendre
// profondément réactif.
const editor = shallowRef<ace.Ace.Editor | null>(null);

const classes = computed((): string => (props.readonly ? 'readonly ' : '') + props.myclass);
const style = computed(() => {
  if (props.height === undefined) {
    return { 'min-height': '250px' };
  } else {
    return { 'min-height': props.height + 'px!important' };
  }
});

function getRawValue(): string | undefined {
  return editor.value?.getValue();
}

function getEditor(): ace.Ace.Editor | null {
  return editor.value;
}

function setContent(value: string | undefined): void {
  nextTick(() => {
    editor.value?.getSession().setValue(value ?? '');
  });
}

watch(isDark, (value) => {
  editor.value?.setTheme(aceTheme(value));
});

onMounted(() => {
  nextTick(() => {
    if (!editorEl.value) {
      return;
    }
    // `enableKeyboardAccessibility` : sans lui, Tab indente et le focus ne
    // sort plus de l'éditeur au clavier (WCAG 2.1.2, audit de la DA).
    const instance = ace.edit(editorEl.value, {
      enableKeyboardAccessibility: true,
      mode: 'ace/mode/json',
    });
    editor.value = instance;
    instance.textInput.getElement().setAttribute('aria-label', 'JSON editor');
    instance.setTheme(aceTheme(isDark.value));
    instance.setFontSize(15);
    instance.getSession().setTabSize(2);
    instance.setReadOnly(props.readonly);
    setContent(props.content);

    for (const [name, bindKey] of Object.entries(props.shortcuts)) {
      instance.commands.addCommand({
        name,
        bindKey,
        exec: () => emit('shortcut', name),
      });
    }

    // WARNING - Beware of update loops!
    // This event is triggered both when the content changes after
    // user interaction and when it is set programmatically.
    instance.on('change', () => {
      emit('change', instance.getValue());
    });
  });
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.removeAllListeners('change');
  }
});

defineExpose({ getEditor, getRawValue, setContent });
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
