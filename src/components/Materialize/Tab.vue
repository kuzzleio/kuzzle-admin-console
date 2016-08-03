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
      name: String
    },
    events: {
      'tab-select' (name) {
        if (!name) {
          return
        }

        this.select(name)
      }
    },
    computed: {
      computedClasses () {
        return this.disabled ? ['disabled'] : []
      },
      index () {
        return this.$parent.$children.indexOf(this)
      }
    },
    methods: {
      setAsSelected () {
        if (!this.disabled) {
          this.$dispatch('tabs-on-select', this)
        }
      },
      select (name) {
        if (this.name === name) {
          this.setAsSelected()
        }
      }
    }
  }
</script>