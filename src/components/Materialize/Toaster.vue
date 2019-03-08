<template>
    <div class="toast-error"></div>
</template>

<script>
export default {
  name: 'Toaster',
  watch: {
    '$store.state.toaster.toast'() {
      /* eslint no-undef: 0 */
      Materialize.toast(
        this.$store.state.toaster.toast.text,
        this.$store.state.toaster.toast.duration,
        this.$store.state.toaster.toast.cssClass,
        this.$store.state.toaster.toast.cb
      )
    }
  }
}
</script>
