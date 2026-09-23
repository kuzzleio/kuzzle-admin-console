<template>
  <div data-slot="select-group" role="group" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/* Groupe d'options, associé à son `SelectLabel` par `aria-labelledby` au site
 * d'appel quand il y en a un. */
export default defineComponent({
  name: 'SelectGroup',
  inheritAttrs: false,
});
</script>
