<template>
  <modal
    class="BulkDeleteModal"
    :is-open="isOpen"
    :close="onClose"
    :loading="isLoading"
  >
    <h4>Document deletion</h4>

    <p v-if="candidatesForDeletion.length > 1">
      Do you really want to delete {{ candidatesForDeletion.length }} documents?
    </p>
    <p v-if="candidatesForDeletion.length === 1">
      Do you really want to delete {{ candidatesForDeletion[0] }}?
    </p>

    <span slot="footer">
      <button
        href="#"
        class="waves-effect waves-green btn red-color"
        @click="$emit('confirm', candidatesForDeletion)"
      >
        I'm sure!
      </button>
      <button
        href="#"
        class="btn-flat"
        @click.prevent="onClose"
      >
        Cancel
      </button>
    </span>
  </modal>
</template>

<script>
import Modal from '../../Materialize/Modal'
export default {
  name: 'DeleteModal',
  components: {
    Modal
  },
  props: {
    candidatesForDeletion: Array,
    isOpen: Boolean,
    isLoading: Boolean
  },
  methods: {
    onClose() {
      this.$emit('close')
    }
  }
}
</script>
