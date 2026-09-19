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
      :environment-id="environmentId"
      :open.sync="createOrUpdateOpen"
      @environment::importEnv="importEnvironment"
    />
    <modal-delete :environment-id="environmentId" :open.sync="deleteOpen" />
    <modal-import :open.sync="importOpen" />
    <telemetry-banner />
  </div>
</template>

<script>
import '@/assets/tailwind.css';
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
      createOrUpdateOpen: false,
      importOpen: false,
      deleteOpen: false,
      environmentId: null,
    };
  },
  methods: {
    editEnvironment(id) {
      this.environmentId = id;
      this.createOrUpdateOpen = true;
    },
    deleteEnvironment(id) {
      this.environmentId = id;
      this.deleteOpen = true;
    },
    importEnvironment() {
      this.importOpen = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.App {
  height: 100%;
}
</style>
