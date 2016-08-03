<template>
  <span :class="class">
    <a class="action dropdown-button fa fa-ellipsis-v" data-activates="{{id}}"></a>

    <ul id="{{id}}" class='dropdown-content'>
      <slot></slot>
    </ul>
  </span>
</template>

<style lang="scss">
  a.dropdown-button {
    cursor: pointer;
  }

  .action {
    padding: 0 7px;
  }

  .icon-small {
    .action {
      font-size: 1.2rem;
      vertical-align: 2px;
    }
  }

  .icon-medium {
    .fa-ellipsis-v {
      font-size: 1.8rem;
      vertical-align: 2px;
    }
  }

  .icon-black {
    .action {
      color: #333;
    }
  }
</style>

<script>
  export default {
    props: ['id', 'class'],
    ready () {
      /*eslint no-undef: 0*/
      $(this.$el).find('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true})
    }
  }
</script>
