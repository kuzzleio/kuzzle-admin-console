<template>
  <div class="ListViewButtons">
    <a
      class="ListViewButtons-btn fa fa-list"
      data-cy="ViewBtn--list"
      title="Display these items as a list"
      :class="{ active: activeView === 'list' }"
      @click="$emit('list')"
    />
    <a
      class="ListViewButtons-btn fa fa-list rotate"
      data-cy="ViewBtn--column"
      title="Display these items as column"
      :class="{ active: activeView === 'column' }"
      @click="$emit('column')"
    />
    <!-- <a
      class="ListViewButtons-btn fa fa-th"
      :class="{ disabled: !boxesEnabled, active: activeView === 'boxes' }"
      :title="boxesEnabled ? 'Display these items as boxes' : ''"
      @click="onBoxesClicked"
    />
    <a
      title="Display a time series view"
      class="ListViewButtons-btn fas fa-chart-line"
      :class="{ active: activeView === 'time-series' }"
      @click="onTimeSeriesClicked"
    />
    <a
      class="ListViewButtons-btn fa fa-map-marked"
      :class="{ disabled: !mapEnabled, active: activeView === 'map' }"
      :title="mapEnabled ? 'Display these items on a map' : ''"
      @click="onMapClicked"
    /> -->
  </div>
</template>

<script>
export default {
  name: 'ListViewButtons',
  props: {
    activeView: {
      type: String,
      required: false,
      default: 'list',
    },
    boxesEnabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    mapEnabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    timeSeriesEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  methods: {
    onBoxesClicked() {
      if (this.boxesEnabled) {
        this.$emit('boxes');
      }
    },
    onMapClicked() {
      if (this.mapEnabled) {
        this.$emit('map');
      }
    },
    onTimeSeriesClicked() {
      if (this.timeSeriesEnabled) {
        this.$emit('time-series');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.ListViewButtons {
  padding-top: 17px;
  text-align: right;
}
.ListViewButtons-btn {
  margin-right: 10px;
  cursor: pointer;
  font-size: 1.4em;

  &.active {
    color: $blue-color;
  }

  &.disabled {
    color: $disabled-color;
  }
}
.rotate {
  transform: rotate(90deg);
}
</style>
