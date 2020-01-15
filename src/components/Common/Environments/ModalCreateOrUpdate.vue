<template>
  <b-modal
    size="xl"
    ref="modal-create-env"
    :id="id"
    :title="`${environmentId ? 'Update' : 'Create'} Connection`"
    @ok.prevent="submit"
  >
    <create-environment
      ref="createEnvironmentComponent"
      :environment-id="environmentId"
      @environment::importEnv="importEnv"
    />

    <span slot="footer">
      <button
        type="submit"
        class="EnvironmentsCreateModal-submit Environment-SubmitButton waves-effect btn"
      >
        {{ environmentId ? 'Update' : 'Create' }}
      </button>
      <button class="btn-flat waves-effect waves-grey" @click.prevent="close">
        Cancel
      </button>
    </span>
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
