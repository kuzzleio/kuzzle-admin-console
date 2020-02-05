<template>
  <b-modal
    id="documentsDeleteModal"
    title="Document deletion"
    class="BulkDeleteModal"
    ok-title="I'm sure!"
    cancel-title="Cancel"
    :busy="isLoading"
    @close="onClose"
    @ok="onOk"
    @cancel="onClose"
  >
    <p v-if="candidatesForDeletion.length > 1">
      Do you really want to delete {{ candidatesForDeletion.length }} documents?
    </p>
    <p v-if="candidatesForDeletion.length === 1">
      Do you really want to delete {{ candidatesForDeletion[0] }}?
    </p>
  </b-modal>
</template>

<script>
export default {
  name: 'DeleteModal',
  props: {
    candidatesForDeletion: Array,
    isOpen: Boolean,
    isLoading: Boolean
  },
  methods: {
    onOk(e) {
      e.preventDefault()
      this.$emit('confirm', this.candidatesForDeletion)
    },
    onClose() {
      this.$emit('close')
    }
  }
}
</script>
