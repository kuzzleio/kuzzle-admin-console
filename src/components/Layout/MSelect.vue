<script>
  export default {
    id: 'm-select',
    bind () {
      /* eslint no-undef: 0 */
      setTimeout(() => {
        $(this.el).material_select()
      }, 0)
    }
  }
</script>