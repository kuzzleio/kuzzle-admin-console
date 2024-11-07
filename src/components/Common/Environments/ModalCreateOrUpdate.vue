<template>
  <b-modal
    :id="id"
    ref="modal-create-env"
    size="xl"
    :title="`${environmentId ? 'Update' : 'Create'} Connection`"
  >
    <create-environment
      ref="createEnvironmentComponent"
      :environment-id="environmentId"
      @environment::importEnv="importEnv"
    />

    <template #modal-footer>
      <b-button variant="outline-secondary" @click="$bvModal.hide(id)"> Cancel </b-button>
      <b-button data-cy="EnvironmentCreateModal-submit" variant="primary" @click="submit">
        OK
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import CreateEnvironment from './CreateEnvironment.vue';

export default {
  name: 'EnvironmentsCreateModal',
  components: {
    CreateEnvironment,
  },
  props: ['environmentId', 'id'],
  methods: {
    importEnv() {
      this.$bvModal.hide(this.id);
      this.$emit('environment::importEnv');
    },
    submit() {
      const submitted = this.$refs.createEnvironmentComponent.submit();
      this.$nextTick(() => {
        if (submitted) {
          this.$bvModal.hide(this.id);
        }
      });
    },
  },
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped></style>
