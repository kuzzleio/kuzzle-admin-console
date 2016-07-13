<template>
  <span>
    <a href="#" class="dropdown-button fa fa-ellipsis-v" data-activates="id"></a>

    <ul id="id" class='dropdown-content'>
      <slot></slot>
    </ul>
  </span>
</template>

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