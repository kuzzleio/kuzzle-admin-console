<template>
  <span :class="class">
    <a class="action dropdown-button fa fa-ellipsis-v" data-activates="{{parsedId}}"></a>

    <ul :id="id" class='dropdown-content'>
      <slot></slot>
    </ul>
  </span>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  span {
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  }
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
      font-size: 1.4rem;
      vertical-align: 4px;
    }
  }

  .icon-black {
    .action {
      color: #666;
    }
  }
</style>

<script>
  export default {
    props: ['id', 'class'],
    computed: {
      parsedId () {
        if (!this.id) {
          return null
        }

        let parsed = this.id

        return parsed.replace(/[!"#$%&'()*_+,./:;<=>?@[\]^`{|}~]/g, '\\$&')
      }
    },
    ready () {
      /* eslint no-undef: 0 */
      $(this.$el).find('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true})
    }
  }
</script>
