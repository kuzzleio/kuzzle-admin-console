<template>
  <b-badge
    class="ml-2"
    data-cy="NewDocumentsBadge"
    pill
    :class="{ pointer: hasNewDocuments }"
    :variant="hasNewDocuments ? 'info' : 'secondary'"
    :title="
      hasNewDocuments
        ? 'New documents that might match your filters have been created. Click to refresh.'
        : 'This circle will turn green when new documents are added to this collection'
    "
    @click="hasNewDocuments ? $emit('refresh') : $emit('noop')"
    >{{ hasNewDocuments ? 'new documents' : '' }}</b-badge
  >
</template>

<script>
export default {
  name: 'NewDocumentsBadge',
  props: {
    hasNewDocuments: Boolean,
  },
};
</script>

<style></style>
