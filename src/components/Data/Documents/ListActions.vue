<template>
  <div class="ListActions row actions">
    <div class="col s8">
      <button
        class="btn btn-small waves-effect waves-light tertiary"
        @click="$emit('toggle-all')">
        <i class="fa left"
          :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'"
        ></i>
        Toggle all
      </button>

      <button class="btn btn-small waves-effect waves-light margin-right-5 primary"
        @click.prevent="$emit('create')"
        :class="!displayCreate ? 'disabled' : ''"
        :disabled="!displayCreate"
        :title="displayCreate ? '' : 'You are not allowed to create a document in this collection'">
        <i class="fa fa-plus-circle left"></i>
        Create
      </button>

      <button class="btn btn-small waves-effect waves-light"
        :class="displayBulkDelete ? 'red-color' : 'disabled'"
        :disabled="!displayBulkDelete"
        @click="$emit('bulk-delete')"
        :title="displayBulkDelete ? '' : 'You need to select at least one element'">
        <i class="fa fa-minus-circle left"></i>
        Delete
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListActions',
  props: {
    allChecked: Boolean,
    displayCreate: Boolean,
    displayBulkDelete: Boolean
  }
}
</script>
