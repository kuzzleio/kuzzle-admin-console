<template>
  <div class="ListViewButtons">
    <a
      class="ListViewButtons-btn fa fa-list"
      :class="{active: activeView === 'list'}"
      @click="$emit('list')"></a>
    <a
      class="ListViewButtons-btn fa fa-th"
      :class="{disabled: !boxesEnabled, active: activeView === 'boxes'}"
      :title="boxesEnabled ? 'Display this list as boxes' : ''"
      @click="$emit('boxes')"
      >
    </a>
    <a
      class="ListViewButtons-btn fa fa-map-marked"
      :class="{disabled: !mapEnabled, active: activeView === 'map'}"
      @click="$emit('map')"
      >
    </a>
  </div>
</template>

<script>
export default {
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

