<template>
  <div class="Headline">
    <!--
      Le preflight remet `h1`–`h6` à la taille du texte courant (ADR-0022) :
      un titre porte désormais sa taille, comme les primitives le font déjà.
      Style « Headline » de DESIGN.md : Montserrat 800, 26 px. C'est le titre
      de la page, donc son `h1`.
    -->
    <h1 class="font-heading text-headline font-extrabold text-foreground">
      <slot>{{ title }}</slot>
    </h1>
    <breadcrumb />
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '@/components/Common/Breadcrumb.vue';

defineProps<{
  title?: string;
}>();
</script>
