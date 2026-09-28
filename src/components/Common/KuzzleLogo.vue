<template>
  <!--
    Logo Kuzzle selon le thème (ADR-0056) : le logo bleu Kuzzle disparaît sur
    les surfaces sombres, où le logo blanc prend sa place. `alt`, `class` et
    `height` passent à l'image.
  -->
  <img :src="isDark ? logoWhite : logo" />
</template>

<script setup lang="ts">
import logoWhite from '@/assets/logo-white.svg';
import logo from '@/assets/logo.svg';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>
