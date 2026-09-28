<template>
  <div class="JsonTreeNode" :class="depth > 0 ? 'pl-6' : ''">
    <div class="flex min-h-6 items-center gap-1">
      <button
        v-if="expandable"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-label="`${isOpen ? 'Collapse' : 'Expand'} ${name ?? 'value'}`"
        class="-ml-6 inline-flex size-6 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-sm border-0 bg-transparent p-0 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        type="button"
        @click="isOpen = !isOpen"
      >
        <i
          aria-hidden="true"
          class="fas fa-caret-right text-xs transition-transform duration-fast"
          :class="{ 'rotate-90': isOpen }"
        />
      </button>
      <span v-if="name !== undefined" class="JsonTree-key font-semibold text-foreground"
        >{{ name }}:</span
      >

      <template v-if="kind === 'object' || kind === 'array'">
        <span v-if="empty" class="JsonTree-empty text-muted-foreground">{{
          kind === 'array' ? '[]' : '{}'
        }}</span>
        <span v-else class="text-muted-foreground">{{ summary }}</span>
      </template>
      <a
        v-else-if="kind === 'url'"
        class="JsonTree-string break-all text-info underline"
        :href="String(value)"
        rel="noopener noreferrer"
        target="_blank"
        >"{{ value }}"</a
      >
      <span v-else :class="valueClasses">{{ displayValue }}</span>
    </div>

    <div v-if="expandable && isOpen">
      <JsonTreeNode
        v-for="[childName, child] of entries"
        :key="childName"
        :depth="depth + 1"
        :name="childName"
        :open="open"
        :value="child"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

/*
 * Un nœud de `JsonTree`, récursif. Remplace le rendu de `json-formatter-js`
 * (ADR-0053) : un vrai `<button aria-expanded>` pour replier, là où la
 * bibliothèque posait un `<a>` sans `href`, que le clavier n'atteignait pas.
 */
const props = defineProps<{
  depth: number;
  name?: string;
  open: boolean;
  value: unknown;
}>();

const isOpen = ref(props.open);

const kind = computed(() => {
  const { value } = props;

  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'string') return /^https?:\/\//.test(value) ? 'url' : 'string';

  return typeof value;
});

const entries = computed((): [string, unknown][] => {
  if (kind.value === 'array') {
    return (props.value as unknown[]).map((child, index) => [String(index), child]);
  }
  if (kind.value === 'object') {
    return Object.entries(props.value as Record<string, unknown>);
  }

  return [];
});

const empty = computed(() => entries.value.length === 0);
const expandable = computed(() => !empty.value && ['array', 'object'].includes(kind.value));

/* `Array[3]` et `Object`, comme le disait `json-formatter-js` ; replié, on
   ajoute le nombre de clés pour que la ligne dise ce qu'elle cache. */
const summary = computed(() => {
  const label = kind.value === 'array' ? `Array[${entries.value.length}]` : 'Object';

  return isOpen.value || kind.value === 'array' ? label : `${label} {${entries.value.length}}`;
});

const displayValue = computed(() => {
  if (kind.value === 'string') return `"${props.value}"`;
  if (kind.value === 'undefined') return 'undefined';

  return String(props.value);
});

const valueClasses = computed(() => {
  switch (kind.value) {
    case 'string':
      return 'JsonTree-string break-all text-info';
    case 'number':
    case 'bigint':
      return 'JsonTree-number text-primary';
    default:
      return 'JsonTree-literal text-muted-foreground';
  }
});
</script>
