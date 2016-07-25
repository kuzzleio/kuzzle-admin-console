<template>
  <div class="md-tabs">
    <ul class="tabs">
      <slot></slot>
      <div v-el:indicator class="indicator"></div>
    </ul>

    <slot name="contents"></slot>
  </div>
</template>

<script>
  import Velocity from 'velocity-animate'

  // translated from http://appcomponents.org/material-components/#!/tabs/sources
  export default {
    props: ['active'],
    watch: {
      active (value) {
        this.$emit('tab-changed', value)
      }
    },
    events: {
      'tabs-on-select' (tab) {
        this.select(tab)
      }
    },
    ready () {
      if (this.active) {
        this.$broadcast('tab-select', this.active)
      }

      window.addEventListener('resize', this.resizeIndicator)
    },
    data () {
      return {
        indicator: {
          left: '0',
          right: '0'
        }
      }
    },
    computed: {
      tabsCount () {
        if (!this.$children) {
          return 0
        } else {
          return this.$children.length
        }
      }
    },
    methods: {
      select (tab) {
        this.activeTab = tab
        this.active = tab.id

        let target = tab.$el
        let parent = target.parentElement

        this.moveIndicator(
          this.indicator.left,
          target.offsetLeft,
          parent.offsetWidth - target.offsetLeft - target.offsetWidth
        )

        return true
      },
      resizeIndicator () {
        if (!this.activeTab) {
          return
        }

        let indicator = this.$els.indicator

        let index = this.activeTab.index
        let tabs = this.activeTab.$el.parentElement
        let tabsWidth = tabs.offsetWidth
        let tabWidth = Math.max(tabsWidth, tabs.scrollWidth) / this.tabsCount

        if (tabWidth !== 0 && tabsWidth !== 0) {
          indicator.style.right = (tabsWidth - ((index + 1) * tabWidth)) + 'px'
          indicator.style.left = (index * tabWidth) + 'px'
        }
      },
      moveIndicator (left, newLeft, newRight) {
        let indicator = this.$els.indicator

        // Update indicator
        if ((newLeft - left) >= 0) {
          Velocity(indicator, {right: newRight}, {duration: 300, queue: false, easing: 'easeOutQuad'})
          Velocity(indicator, {left: newLeft}, {duration: 300, queue: false, easing: 'easeOutQuad', delay: 90})
        } else {
          Velocity(indicator, {left: newLeft}, {duration: 300, queue: false, easing: 'easeOutQuad'})
          Velocity(indicator, {right: newRight}, {duration: 300, queue: false, easing: 'easeOutQuad', delay: 90})
        }
      }
    }
  }
</script>