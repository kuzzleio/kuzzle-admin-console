<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--color-card)',
      '--normal-text': 'var(--color-card-foreground)',
      '--normal-border': 'var(--color-border)',
      '--border-radius': 'var(--radius)',
      '--success-bg': 'color-mix(in oklab, var(--color-success) 15%, var(--color-card))',
      '--success-border': 'color-mix(in oklab, var(--color-success) 60%, transparent)',
      '--success-text': 'var(--color-foreground)',
      '--info-bg': 'var(--color-secondary)',
      '--info-border': 'color-mix(in oklab, var(--color-info) 30%, transparent)',
      '--info-text': 'var(--color-foreground)',
      '--warning-bg': 'color-mix(in oklab, var(--color-warning) 15%, var(--color-card))',
      '--warning-border': 'color-mix(in oklab, var(--color-warning) 60%, transparent)',
      '--warning-text': 'var(--color-foreground)',
      '--error-bg': 'color-mix(in oklab, var(--color-destructive) 10%, var(--color-card))',
      '--error-border': 'color-mix(in oklab, var(--color-destructive) 40%, transparent)',
      '--error-text': 'var(--color-destructive)',
      zIndex: 'var(--z-toast)',
    }"
    :theme="isDark ? 'dark' : 'light'"
    :toast-options="{
      ...props.toastOptions,
      class: cn('font-sans shadow-menu', props.toastOptions?.class),
    }"
    v-bind="forwarded"
  >
    <template #success-icon>
      <i aria-hidden="true" class="fas fa-check-circle" />
    </template>
    <template #info-icon>
      <i aria-hidden="true" class="fas fa-info-circle" />
    </template>
    <template #warning-icon>
      <i aria-hidden="true" class="fas fa-exclamation-triangle" />
    </template>
    <template #error-icon>
      <i aria-hidden="true" class="fas fa-exclamation-circle" />
    </template>
    <template #loading-icon>
      <Spinner size="sm" />
    </template>
    <template #close-icon>
      <i aria-hidden="true" class="fas fa-times" />
    </template>
  </Sonner>
</template>

<script lang="ts" setup>
import { reactiveOmit } from '@vueuse/core';
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner';
import 'vue-sonner/style.css';

import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/composables/useTheme';
import { cn } from '@/lib/utils';

/*
 * Toaster de shadcn-vue (ADR-0054, ADR-0058), sur `vue-sonner`.
 *
 * Écarts, tous de DA (DESIGN.md) :
 *
 * - **icônes Font Awesome** à la place de lucide, `Spinner` pour le
 *   chargement ;
 * - **couleurs par type** : `rich-colors` est actif, et ses variables
 *   reçoivent les teintes de la primitive précédente — mêlées à `card`, pas
 *   à la transparence, sans quoi un toast est illisible sur ce qu'il
 *   recouvre (E-03). L'amont n'utilise que les variables `normal` ;
 * - **`z-index` en token** (`--z-toast`, ADR-0054 point 5) : la feuille de
 *   sonner pose 999999999, qui passerait au-dessus du lien d'évitement ;
 * - **le thème suit celui de la console** (`useTheme`), pas
 *   `prefers-color-scheme` : la bascule peut imposer clair ou sombre
 *   (ADR-0056).
 */
const props = withDefaults(defineProps<ToasterProps>(), {
  position: 'bottom-right',
  richColors: true,
});

const { isDark } = useTheme();
const forwarded = reactiveOmit(props, 'class', 'theme', 'toastOptions');
</script>
