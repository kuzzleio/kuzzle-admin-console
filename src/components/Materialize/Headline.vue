<template>
  <div class="Headline">
    <!--
      Le preflight remet `h1`–`h6` à la taille du texte courant (ADR-0022) :
      un titre porte désormais sa taille, comme les primitives le font déjà.
    -->
    <h2 class="text-3xl font-bold text-foreground">
      <slot>{{ title }}</slot>
    </h2>
    <breadcrumb />
  </div>
</template>

<script>
import Breadcrumb from '@/components/Common/Breadcrumb.vue';

export default {
  name: 'Headline',
  components: {
    Breadcrumb,
  },
  props: {
    title: String,
  },
};
</script>
