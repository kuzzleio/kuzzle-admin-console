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
      'tab-select' (id) {
        if (!id) {
          return
        }

        this.select(id)
      }
    },
    computed: {
      computedClasses () {
        return this.disabled ? ['disabled'] : []
      },
      index () {
        return this.$parent.$children.indexOf(this)
      },
      id () {
        if (this.name) {
          return this.name
        } else {
          return this.index
        }
      }
    },
    methods: {
      setAsSelected () {
        if (!this.disabled) {
          this.$dispatch('tabs-on-select', this)
        }
      },
      select (id) {
        if (this.id === id) {
          this.setAsSelected()
        }
      }
    },
    ready () {
      let hash = window.location.hash
      let el = this.$el
      let anchors = el.getElementsByTagName('A')

      for (let i = 0; i < anchors.length; i++) {
        let a = anchors[i]
        if (hash === a.getAttribute('href')) {
          this.setAsSelected()
        }
      }
    }
  }
</script>