<template>
    <div class="toast-error"></div>
</template>

<script>
export default {
  name: 'Toaster',
  watch: {
    '$store.state.toaster.toast'() {
      /* eslint no-undef: 0 */
      M.toast({
        html: this.$store.state.toaster.toast.text,
        inDuration: this.$store.state.toaster.toast.duration,
        classes: this.$store.state.toaster.toast.cssClass,
        completeCallback: this.$store.state.toaster.toast.cb
      })
    }
  }
}
</script>
