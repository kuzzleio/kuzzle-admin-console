<template>
  <div class="App">
    <router-view
      @environment::create="editEnvironment"
      @environment::delete="deleteEnvironment"
      @environment::importEnv="importEnvironment"
    />

    <modal-create-or-update
      v-model:open="createOrUpdateOpen"
      :environment-id="environmentId"
      @environment::importEnv="importEnvironment"
    />
    <modal-delete v-model:open="deleteOpen" :environment-id="environmentId" />
    <modal-import v-model:open="importOpen" />
    <telemetry-banner />
    <!--
      La zone de notifications est montée une fois, ici : `bootstrap-vue` la
      fabriquait à la volée au premier `$bvToast.toast()` (ADR-0020).
    -->
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import '@/assets/tailwind.css';
import '@/assets/style.scss';
import { Toaster } from '@/components/ui/sonner';

import ModalCreateOrUpdate from '@/components/Common/Environments/ModalCreateOrUpdate.vue';
import ModalDelete from '@/components/Common/Environments/ModalDelete.vue';
import ModalImport from '@/components/Common/Environments/ModalImport.vue';
import TelemetryBanner from '@/components/TelemetryBanner.vue';

const createOrUpdateOpen = ref(false);
const importOpen = ref(false);
const deleteOpen = ref(false);
const environmentId = ref<string>();

function editEnvironment(id: string): void {
  environmentId.value = id;
  createOrUpdateOpen.value = true;
}

function deleteEnvironment(id: string): void {
  environmentId.value = id;
  deleteOpen.value = true;
}

function importEnvironment(): void {
  importOpen.value = true;
}
</script>

<style lang="scss" scoped>
.App {
  height: 100%;
}
</style>
