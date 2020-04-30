<template>
  <li class="tab col" :class="computedClasses" @click.prevent="setAsSelected">
    <slot />
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
  computed: {
    computedClasses() {
      return this.disabled ? ['disabled'] : []
    },
    index() {
      return this.$parent.$children.indexOf(this)
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
  mounted() {
    if (this.tabSelect) {
      this.select(this.tabSelect)
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
  }
}
</script>
