<template>
  <div class="App">
    <template>
      <router-view
        @environment::create="editEnvironment"
        @environment::delete="deleteEnvironment"
        @environment::importEnv="importEnvironment"
      />
    </template>

    <modal-create-or-update
      id="modal-env-create-or-update"
      :environment-id="environmentId"
      @environment::importEnv="importEnvironment"
    />
    <modal-delete id="modal-env-delete" :environment-id="environmentId" />
    <modal-import id="modal-env-import" />
    <telemetry-banner />
  </div>
</template>

<script>
import '@/assets/style.scss';
import ModalCreateOrUpdate from '@/components/Common/Environments/ModalCreateOrUpdate.vue';
import ModalDelete from '@/components/Common/Environments/ModalDelete.vue';
import ModalImport from '@/components/Common/Environments/ModalImport.vue';
import TelemetryBanner from '@/components/TelemetryBanner.vue';

export default {
  name: 'KuzzleAdminConsole',
  components: {
    ModalCreateOrUpdate,
    ModalDelete,
    ModalImport,
    TelemetryBanner,
  },
  data() {
    return {
      environmentId: null,
    };
  },
  methods: {
    editEnvironment(id) {
      this.environmentId = id;
      this.$bvModal.show('modal-env-create-or-update');
    },
    deleteEnvironment(id) {
      this.environmentId = id;
      this.$bvModal.show('modal-env-delete');
    },
    importEnvironment() {
      this.$bvModal.show('modal-env-import');
    },
  },
};
</script>

<style lang="scss" scoped>
.App {
  height: 100%;
}
</style>
