<template>
  <div class="md-tabs">
    <ul class="tabs">
      <slot></slot>
      <div ref="indicator" class="indicator"></div>
    </ul>

    <slot name="contents"></slot>
  </div>
</template>

<script>
  import Velocity from 'velocity-animate'
  import Vue from 'vue'

  // translated from http://appcomponents.org/material-components/#!/tabs/sources
  export default {
    props: ['active', 'isDisplayed'],
    watch: {
      active (value) {
        this.$emit('tab-changed', value)
      },
      isDisplayed () {
        if (this.isDisplayed) {
          this.$emit('tab-select', this.active)
        }
      }
    },
    events: {
      'tabs-on-select' (tab) {
        this.select(tab)
      }
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
        return this.$children.length
      }
    },
    methods: {
      select (tab) {
        this.activeTab = tab
        this.active = tab.name

        let target = tab.$el
        let parent = target.parentElement

        this.moveIndicator(
          target.offsetLeft,
          parent.offsetWidth - target.offsetLeft - target.offsetWidth
        )
      },
      resizeIndicator () {
        if (!this.activeTab) {
          return
        }

        let indicator = this.$refs.indicator

        let index = this.activeTab.index
        let tabs = this.activeTab.$el.parentElement
        let tabsWidth = tabs.offsetWidth
        let tabWidth = Math.max(tabsWidth, tabs.scrollWidth) / this.tabsCount

        if (tabWidth !== 0 && tabsWidth !== 0) {
          indicator.style.right = (tabsWidth - ((index + 1) * tabWidth)) + 'px'
          indicator.style.left = (index * tabWidth) + 'px'
        }
      },
      moveIndicator (newLeft, newRight) {
        let indicator = this.$refs.indicator
        Velocity(indicator, {left: newLeft, right: newRight}, {duration: 300, queue: false, easing: 'easeOutQuad'})
      }
    },
    mounted () {
      Vue.nextTick(() => {
        if (this.active) {
          this.$emit('tab-select', this.active)
        }

        window.addEventListener('resize', this.resizeIndicator)
      })
    },
    destroyed () {
      window.removeEventListener('resize', this.resizeIndicator)
    }
  }
</script>