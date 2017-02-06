<template>
  <form class="wrapper" @submit.prevent="next">


    <!-- Actions -->
    <div class="row">
      <div class="col s5 m4 l4">
        <a tabindex="6" class="btn-flat waves-effect" @click.prevent="cancel">Cancel</a>
        <button type="submit" class="btn primary waves-effect waves-light">
          Save
        </button>
      </div>
    </div>
  </form>
</template>

<script>
  export default {
    name: 'CollectionForm',
    props: {
      mapping: Object
    },
    methods: {
      next () {
        console.log('ok')
      },
      cancel () {
        this.$emit('cancel')
      }
    }
  }
</script>