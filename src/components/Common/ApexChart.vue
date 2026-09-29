<template>
  <div ref="container" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue';
import ApexCharts, { type ApexOptions } from 'apexcharts';
import cloneDeep from 'lodash/cloneDeep';

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

function config(): ApexOptions {
  const options = cloneDeep(toRaw(props.options));

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
  updateOptions: (options: ApexOptions) => chart?.updateOptions(cloneDeep(toRaw(options))),
});
</script>
