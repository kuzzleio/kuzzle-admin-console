<template>
  <Badge
    class="ms-2 min-h-4 min-w-4 justify-center rounded-full"
    :class="{ 'cursor-pointer': hasNewDocuments }"
    data-cy="NewDocumentsBadge"
    :title="
      hasNewDocuments
        ? 'New documents that might match your filters have been created. Click to refresh.'
        : 'This circle will turn green when new documents are added to this collection'
    "
    :variant="hasNewDocuments ? 'success' : 'secondary'"
    @click="hasNewDocuments ? $emit('refresh') : $emit('noop')"
    >{{ hasNewDocuments ? 'new documents' : '' }}</Badge
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Badge } from '@/components/ui/badge';

/*
 * `rounded-full` et une taille minimale : sans document nouveau, le badge n'a
 * pas de texte et c'est sa seule forme visible — une pastille. `Badge` est en
 * `rounded-md` par défaut, ce qui donnerait un carré de 4 px.
 */
export default defineComponent({
  name: 'NewDocumentsBadge',
  components: {
    Badge,
  },
  props: {
    hasNewDocuments: {
      default: false,
      type: Boolean,
    },
  },
});
</script>
