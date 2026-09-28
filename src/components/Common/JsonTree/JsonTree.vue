<template>
  <div class="JsonTree pl-6 font-mono text-small" data-cy="JsonTree">
    <JsonTreeNode :depth="0" :open="open" :value="value" />
  </div>
</template>

<script setup lang="ts">
import JsonTreeNode from './JsonTreeNode.vue';

/*
 * Arbre JSON en lecture seule (ADR-0053). Remplace la directive
 * `v-json-formatter` et `json-formatter-js`, dont les flèches n'étaient pas
 * atteignables au clavier, la feuille de style était injectée dans `<head>`
 * et les couleurs codées en dur. Ici, tout vient des tokens, thème sombre
 * compris.
 *
 * `pl-6` loge les flèches (24 px, WCAG 2.5.8), placées en retrait négatif
 * pour que les clés d'un même niveau restent alignées, qu'elles se replient ou
 * non.
 */
withDefaults(defineProps<{ open?: boolean; value: unknown }>(), { open: true });
</script>
