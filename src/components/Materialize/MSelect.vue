<template>

</template>

<script>
  export default {
    id: 'm-select',
    twoWay: true,
    bind () {
      /* eslint no-undef: 0 */
      setTimeout(() => {
        let $el = $(this.el)

        $el.material_select()
        $el.on('change', () => {
          this.set(this.el.value)
        })
      }, 0)
    }
  }
</script>