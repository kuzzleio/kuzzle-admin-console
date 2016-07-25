<template>
  <span>
    <a class="action dropdown-button fa fa-ellipsis-v" data-activates="{{id}}"></a>

    <ul id="{{id}}" class='dropdown-content'>
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
      /*eslint no-undef: 0*/
      $(this.$el).find('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true})
    }
  }
</script>
