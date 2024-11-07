<template>
  <div class="md-tabs">
    <ul class="tabs">
      <slot />
      <div ref="indicator" class="indicator" />
    </ul>

    <slot name="contents" />
  </div>
</template>

<script>
import Vue from 'vue';
import Velocity from 'velocity-animate';

// translated from http://appcomponents.org/material-components/#!/tabs/sources
export default {
  props: ['active', 'isDisplayed', 'objectTabActive'],
  data() {
    return {
      activeTab: null,
    };
  },
  computed: {
    tabsCount() {
      return this.$children.length;
    },
  },
  watch: {
    isDisplayed() {
      if (this.isDisplayed) {
        this.select(this.objectTabActive);
      }
    },
    objectTabActive(tab) {
      this.select(tab);
    },
  },
  mounted() {
    Vue.nextTick(() => {
      window.addEventListener('resize', this.resizeIndicator);
    });
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeIndicator);
  },
  methods: {
    select(tab) {
      this.activeTab = tab;

      const target = tab.$el;
      const parent = target.parentElement;

      this.moveIndicator(
        target.offsetLeft,
        parent.offsetWidth - target.offsetLeft - target.offsetWidth,
      );
      this.$emit('tab-changed', tab.name);
    },
    resizeIndicator() {
      if (!this.activeTab) {
        return;
      }

      const indicator = this.$refs.indicator;

      const index = this.activeTab.index;
      const tabs = this.activeTab.$el.parentElement;
      const tabsWidth = tabs.offsetWidth;
      const tabWidth = Math.max(tabsWidth, tabs.scrollWidth) / this.tabsCount;

      if (tabWidth !== 0 && tabsWidth !== 0) {
        indicator.style.right = tabsWidth - (index + 1) * tabWidth + 'px';
        indicator.style.left = index * tabWidth + 'px';
      }
    },
    moveIndicator(newLeft, newRight) {
      const indicator = this.$refs.indicator;
      Velocity(
        indicator,
        { left: newLeft, right: newRight },
        { duration: 300, queue: false, easing: 'easeOutQuad' },
      );
    },
  },
};
</script>
