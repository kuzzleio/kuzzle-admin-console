<template>
  <span :class="myclass">
    <a
      class="action dropdown-button fa fa-ellipsis-v"
      :data-target="parsedId"
    />

    <ul :id="parsedId" class="dropdown-content">
      <slot />
    </ul>
  </span>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
span {
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
}
a.dropdown-button {
  cursor: pointer;
}

.action {
  padding: 0 7px;
}

.icon-small {
  .action {
    font-size: 1.2rem;
    vertical-align: 2px;
  }
}

.icon-medium {
  .fa-ellipsis-v {
    font-size: 1.8rem;
    vertical-align: 4px;
  }
}

.icon-black {
  .action {
    color: #666;
  }
}
</style>

<script>
import Vue from 'vue'
import { formatForDom } from '../../utils'

export default {
  props: ['id', 'myclass'],
  computed: {
    parsedId() {
      if (!this.id) {
        return null
      }

      let parsed = this.id + this._uid

      return formatForDom(parsed)
    }
  },
  mounted() {
    Vue.nextTick(() => {
      /* eslint no-undef: 0 */
      $(this.$el)
        .find('.dropdown-button')
        .dropdown({ constrainWidth: false, belowOrigin: true })
    })
  }
}
</script>
