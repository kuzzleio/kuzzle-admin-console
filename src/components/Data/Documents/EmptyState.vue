<template>
  <div class="EmptyState row valign-bottom empty-set">
    <div class="col s1 offset-s1">
      <i
        class="fa fa-6x fa-file-text-o grey-text text-lighten-1"
        aria-hidden="true"
      />
    </div>
    <div class="col s8 m9 l10">
      <p>
        Here you'll see the documents in <strong>{{ collection }}</strong> <br>
        <em>Currently there is no document in this collection.</em>
      </p>
      <router-link
        :disabled="!canCreateDocument(index, collection)"
        :to="{name: 'DataCreateDocument', params: {index: index, collection: collection}}"
        class="btn primary waves-effect waves-light"
        :class="!canCreateDocument(index, collection) ? 'disabled' : ''"
        :title="!canCreateDocument(index, collection) ? 'You are not allowed to create documents in this collection' : ''"
      >
        <i class="fa fa-plus-circle left" />
        Create a document
      </router-link>
    </div>
  </div>
</template>

<script>
import { canCreateDocument } from '../../../services/userAuthorization'

export default {
  props: {
    index: String,
    collection: String
  },
  methods: {
    canCreateDocument
  }
}
</script>
