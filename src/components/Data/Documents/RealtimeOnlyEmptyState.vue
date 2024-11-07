<template>
  <div class="RealtimeOnlyEmptySet row valign-bottom empty-set">
    <div class="col s1 offset-s1">
      <i class="fa fa-6x fa-file-text-o grey-text text-lighten-1" aria-hidden="true" />
    </div>
    <div class="col s8 m9 l10">
      <p>
        There is no persistent document in here because the collection
        <strong>{{ collection }}</strong> is currently realtime-only.<br />
        <em>You can edit the collection and persist it.</em>
      </p>
      <router-link
        :disabled="!canEditCollection(index, collection)"
        :title="
          !canEditCollection(index, collection) ? 'You are not allowed to edit this collection' : ''
        "
        :class="!canEditCollection(index, collection) ? 'disabled' : ''"
        :to="{
          name: 'EditCollection',
          params: { index: index, collection: collection },
        }"
        class="btn primary waves-effect waves-light"
      >
        <i class="fa fa-pencil left" />
        Edit the collection
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { useAuthStore } from '@/stores';

export default {
  props: {
    index: String,
    collection: String,
  },
  computed: {
    ...mapState(useAuthStore, ['canEditCollection']),
  },
};
</script>
