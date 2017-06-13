<template>
  <span :cmylass="myclass">
    <a class="action dropdown-button fa fa-ellipsis-v" :data-activates="parsedId"></a>

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
      font-size: 1.8rem;
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
  import Vue from 'vue'

  export default {
    props: ['id', 'myclass'],
    computed: {
      parsedId () {
        if (!this.id) {
          return null
        }

        let parsed = this.id

        return parsed.replace(/[!"#$%&'()*_+,./:;<=>?@[\]^`{|}~ ]/g, '\\$&')
      }
    },
    mounted () {
      Vue.nextTick(() => {
        /* eslint no-undef: 0 */
        $(this.$el).find('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true})
      })
    }
  }
</script>
