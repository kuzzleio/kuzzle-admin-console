<template>
  <span>
    <a class="dropdown-button fa fa-ellipsis-v" data-activates="id"></a>

    <ul id="id" class='dropdown-content'>
      <slot></slot>
    </ul>
  </span>
</template>

<style lang="scss" rel="stylesheet/scss">
  a.dropdown-button {
    cursor: pointer;
  }
</style>

<script>
  export default {
    props: ['id'],
    ready () {
      let that = this
      /*eslint no-undef: 0*/
      jQuery(that.$el).find('.dropdown-button').dropdown()
    }
  }
</script>