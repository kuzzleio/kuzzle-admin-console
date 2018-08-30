<template>
  <li @click.prevent="setAsSelected" class="tab col" :class="computedClasses">
    <slot></slot>
  </li>
</template>

<script>
// translated from http://appcomponents.org/material-components/#!/tabs/sources
export default {
  props: {
    disabled: Boolean,
    name: String,
    tabSelect: {
      type: String,
      default: null
    }
  },
  watch: {
    tabSelect(name) {
      if (!name) {
        return
      }

      this.select(name)
    }
  },
  computed: {
    computedClasses() {
      return this.disabled ? ['disabled'] : []
    },
    index() {
      return this.$parent.$children.indexOf(this)
    }
  },
  methods: {
    setAsSelected() {
      if (!this.disabled) {
        this.$emit('tabs-on-select', this)
      }
    },
    select(name) {
      if (this.name === name) {
        this.setAsSelected()
      }
    }
  },
  mounted() {
    if (this.tabSelect) {
      this.select(this.tabSelect)
    }
  }
}
</script>
