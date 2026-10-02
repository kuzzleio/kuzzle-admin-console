<template>
  <div ref="container" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue';
import ApexCharts, { type ApexOptions } from 'apexcharts';
import cloneDeep from 'lodash/cloneDeep';
import escape from 'lodash/escape';

/*
 * ApexChart — le graphique d'ApexCharts, sans wrapper (ADR-0059).
 *
 * Remplace `vue3-apexcharts`, qui n'a plus bougé depuis mars 2026 et ne suit
 * pas les versions 6 et 7 du moteur. Il n'a qu'un site d'appel
 * (`Views/TimeSeries.vue`) et n'en utilisait que ce qu'on retrouve ici :
 * `type`, `series`, `options`, suivis en profondeur, et `updateOptions()` sur
 * la référence.
 *
 * ApexCharts mute les objets qu'on lui passe : il reçoit une copie de
 * l'objet brut (`toRaw`), sans quoi le moteur déclencherait lui-même les
 * observateurs de Vue. `cloneDeep` et non `structuredClone`, qui refuse les
 * fonctions (`formatter`, `events`).
 *
 * Le moteur écrit le nom des séries en `innerHTML`, dans la légende et dans
 * l'info-bulle. Ce nom vient des données (un nom de champ du mapping) : il
 * est échappé ici, sauf si l'appelant fournit son propre `formatter`.
 */
type Series = NonNullable<ApexOptions['series']>;
type ChartType = NonNullable<NonNullable<ApexOptions['chart']>['type']>;

const props = defineProps<{
  options: ApexOptions;
  series: Series;
  type: ChartType;
}>();

const container = ref<HTMLElement | null>(null);
let chart: ApexCharts | null = null;

const seriesNameAsText = (seriesName: string): string => escape(seriesName);

type TooltipY = NonNullable<NonNullable<ApexOptions['tooltip']>['y']>;
type SeriesTooltipY = Exclude<TooltipY, unknown[]>;

const escapedSeriesTooltipY = (y: SeriesTooltipY | undefined): SeriesTooltipY => ({
  ...y,
  title: { formatter: seriesNameAsText, ...y?.title },
});

/* `tooltip.y` est un objet, ou un tableau d'objets, un par série. */
const escapedTooltipY = (y: TooltipY | undefined): TooltipY =>
  Array.isArray(y) ? y.map(escapedSeriesTooltipY) : escapedSeriesTooltipY(y);

function withEscapedSeriesNames(options: ApexOptions): ApexOptions {
  return {
    ...options,
    legend: { formatter: seriesNameAsText, ...options.legend },
    tooltip: { ...options.tooltip, y: escapedTooltipY(options.tooltip?.y) },
  };
}

function config(): ApexOptions {
  const options = withEscapedSeriesNames(cloneDeep(toRaw(props.options)));

  return {
    ...options,
    chart: { ...options.chart, type: props.type },
    series: cloneDeep(toRaw(props.series)),
  };
}

onMounted(() => {
  if (!container.value) {
    return;
  }
  chart = new ApexCharts(container.value, config());
  void chart.render();
});

watch(
  () => props.options,
  () => void chart?.updateOptions(config()),
  { deep: true },
);

watch(
  () => props.series,
  () => void chart?.updateSeries(cloneDeep(toRaw(props.series))),
  { deep: true },
);

onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});

defineExpose({
  updateOptions: (options: ApexOptions) =>
    chart?.updateOptions(withEscapedSeriesNames(cloneDeep(toRaw(options)))),
});
</script>
