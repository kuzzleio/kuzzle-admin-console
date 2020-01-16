<template>
  <b-modal
    size="xl"
    ref="modal-create-env"
    :id="id"
    :title="`${environmentId ? 'Update' : 'Create'} Connection`"
  >
    <create-environment
      ref="createEnvironmentComponent"
      :environment-id="environmentId"
      @environment::importEnv="importEnv"
    />

    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="$bvModal.hide(id)">
        Cancel
      </b-button>
      <b-button
        data-cy="EnvironmentCreateModal-submit"
        variant="primary"
        @click="submit"
      >
        OK
      </b-button>
    </template>
  </b-modal>
</template>

<style lang="scss" rel="stylesheet/scss" scoped></style>

<script>
import CreateEnvironment from './CreateEnvironment'

export default {
  name: 'EnvironmentsCreateModal',
  components: {
    CreateEnvironment
  },
  props: ['environmentId', 'id'],
  methods: {
    importEnv() {
      this.$bvModal.hide(this.id)
      this.$emit('environment::importEnv')
    },
    submit() {
      const submitted = this.$refs.createEnvironmentComponent.createEnvironment()
      this.$nextTick(() => {
        if (submitted) {
          this.$bvModal.hide(this.id)
        }
      })
    }
  }
}
</script>
