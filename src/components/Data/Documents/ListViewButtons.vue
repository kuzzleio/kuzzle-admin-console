<template>
  <div class="ListViewButtons">
    <a
      class="ListViewButtons-btn fa fa-list"
      title="Display these items as a list"
      :class="{active: activeView === 'list'}"
      @click="$emit('list')"></a>
    <a
      class="ListViewButtons-btn fa fa-th"
      :class="{disabled: !boxesEnabled, active: activeView === 'boxes'}"
      :title="boxesEnabled ? 'Display these items as boxes' : ''"
      @click="onBoxesClicked"
      >
    </a>
    <a
      class="ListViewButtons-btn fa fa-map-marked"
      :class="{disabled: !mapEnabled, active: activeView === 'map'}"
      :title="mapEnabled ? 'Display these items on a map' : ''"
      @click="onMapClicked"
      >
    </a>
  </div>
</template>

<script>
export default {
  name: 'ListViewButtons',
  props: {
    activeView: {
      type: String,
      required: false,
      default: 'list'
    },
    boxesEnabled: {
      type: Boolean,
      required: false,
      default: false
    },
    mapEnabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    onBoxesClicked() {
      if (!this.boxesEnabled) {
        return
      }
      this.$emit('boxes')
    },
    onMapClicked() {
      if (!this.mapEnabled) {
        return
      }
      this.$emit('map')
    }
  }
}
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
</style>
