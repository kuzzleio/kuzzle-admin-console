<template>
  <b-modal @hide="$emit('hide')" :id="id" class="BulkDeleteModal">
    <template v-slot:modal-header>
      <h4>Document deletion</h4>
    </template>

    <template v-if="!isLoading">
      <p v-if="candidatesForDeletion.length > 1">
        Do you really want to delete
        {{ candidatesForDeletion.length }} documents?
      </p>
      <p v-if="candidatesForDeletion.length === 1">
        Do you really want to delete
        <span :title="candidatesForDeletion[0]">{{
          truncateName(candidatesForDeletion[0])
        }}</span
        >?
      </p>
    </template>
    <template v-else>
      <b-spinner label="Spinning"></b-spinner>
    </template>
    <template v-slot:modal-footer="{ close }">
      <b-button @click.prevent="close">
        Cancel
      </b-button>
      <b-button
        variant="danger"
        :disabled="isLoading"
        @click="$emit('confirm', candidatesForDeletion)"
      >
        Delete documents
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { truncateName } from '../../../utils' ;

export default {
  name: 'DeleteModal',
  components: {},
  props: {
    id: {
      type: String,
      required: true
    },
    candidatesForDeletion: Array,
    isLoading: Boolean
  },
  methods: {
    truncateName
  }
} ;
</script>
