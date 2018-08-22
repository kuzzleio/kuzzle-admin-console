<template>
  <div class="ListViewButtons">
    <a
      class="fa fa-2x fa-list"
      :class="{active: activeView === 'list'}"
      @click="$emit('list')"></a>
    <a
      class="fa fa-2x fa-th"
      :class="{disabled: !boxesEnabled, active: activeView === 'boxes'}"
      :title="boxesEnabled ? 'Display this list as boxes' : ''"
      @click="$emit('boxes')"
      >
    </a>
    <a
      class="fa fa-2x fa-map-marked"
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
  padding-top: 15px;
  text-align: right;

  a {
    margin-right: 10px;
    cursor: pointer;

    &.active {
      color: $blue-color;
    }

    &.disabled {
      color: $disabled-color;
    }
  }
}
</style>

