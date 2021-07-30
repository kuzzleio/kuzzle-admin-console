<template>
  <b-card class="EmptyState text-center" bg-variant="light">
    <i class="text-secondary fas fa-file-alt fa-6x mb-3"></i>
    <h2 class="text-secondary font-weight-bold">This collection is empty</h2>
    <p class="text-secondary" v-if="canCreateDocument(index, collection)">
      You can create a new document by hitting the button above
    </p>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex' ;
export default {
  props: {
    index: String,
    collection: String
  },
  computed: {
    ...mapGetters('auth', ['canCreateDocument'])
  }
} ;
</script>
