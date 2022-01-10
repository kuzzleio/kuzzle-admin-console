<template>
  <i
    class="fa-circle ml-2"
    data-cy="NewDocumentsBadge"
    variant="info"
    :title="
      hasNewDocuments
        ? 'New documents that might match your filters have been created. Click to refresh.'
        : 'This circle will turn green when new documents are added to this collection'
    "
    :class="{
      fas: hasNewDocuments,
      far: !hasNewDocuments,
      'text-info': hasNewDocuments,
      pointer: hasNewDocuments,
      'text-secondary': !hasNewDocuments
    }"
    @click="hasNewDocuments ? $emit('refresh') : $emit('noop')"
  ></i>
</template>

<script>
export default {
  name: 'NewDocumentsBadge',
  props: {
    hasNewDocuments: Boolean
  }
}
</script>

<style></style>
