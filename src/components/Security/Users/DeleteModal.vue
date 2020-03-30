<template>
  <b-modal data-cy="ModalDeleteUsers" :id="id" @hide="$emit('hide')">
    <template v-slot:modal-header>
      <h4>User deletion</h4>
    </template>

    <template v-if="!isLoading">
      <p v-if="candidatesForDeletion.length > 1">
        Do you really want to delete
        {{ candidatesForDeletion.length }} users?
      </p>
      <p v-if="candidatesForDeletion.length === 1">
        Do you really want to delete
        <span class="code" :title="candidatesForDeletion[0]">{{
          truncateName(candidatesForDeletion[0])
        }}</span
        >?
      </p>
    </template>
    <template v-else>
      <div class="text-center">
        <b-spinner label="Spinning"></b-spinner>
      </div>
    </template>
    <template v-slot:modal-footer="{ close }">
      <b-button @click.prevent="close">
        Cancel
      </b-button>
      <b-button
        data-cy="ModalDeleteUsers-submitBtn"
        variant="danger"
        :disabled="isLoading"
        @click="$emit('confirm', candidatesForDeletion)"
      >
        Delete Users
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { truncateName } from '../../../utils'

export default {
  name: 'UserDeleteModal',
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
}
</script>
