<template>
  <b-modal
    :id="id"
    ref="modal-import-env"
    data-cy="EnvironmentImport"
    title="Import Connection"
    @cancel="reset"
    @close="reset"
    @hide="reset"
  >
    <template #modal-footer>
      <b-button variant="secondary" @click="$bvModal.hide(id)"> Cancel </b-button>
      <b-button
        data-cy="EnvironmentImport-submitBtn"
        variant="primary"
        :disabled="envNames.length === 0"
        @click="importEnv"
      >
        OK
      </b-button>
    </template>

    <b-form-group
      label="Upload a file"
      description="You can drag and drop your file in this input field"
    >
      <b-form-file
        ref="file-input"
        v-model="file"
        accept=".json"
        data-cy="EnvironmentImport-fileInput"
      />
    </b-form-group>

    <b-alert
      :show="file !== null && errors.length === 0 && !loading"
      data-cy="EnvironmentImport-ok"
    >
      ✅ Uploaded file is valid. Found {{ envNames.length }} connections.
    </b-alert>

    <b-alert
      v-for="(err, k) in errors"
      :key="k"
      data-cy="EnvironmentImport-err"
      class="mt-3"
      dismissible
      show
      variant="danger"
      >{{ err }}</b-alert
    >
  </b-modal>
</template>

<script>
import { useKuzzleStore } from '@/stores';

export default {
  name: 'ModalImport',
  components: {},
  props: ['id'],
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      file: null,
      env: {},
      errors: [],
      loading: false,
    };
  },
  computed: {
    envNames() {
      return Object.keys(this.env);
    },
  },
  watch: {
    file: {
      handler() {
        this.$log.debug('File has changed');
        this.upload();
      },
    },
  },
  methods: {
    clearFiles() {
      this.$refs['file-input'].reset();
    },
    reset() {
      this.clearFiles();
      this.errors = [];
      this.env = {};
      this.loading = false;
    },
    async importEnv() {
      let mustSwitch = false;
      if (Object.keys(this.kuzzleStore.environments).length === 0) {
        mustSwitch = true;
      }
      for (const name in this.env) {
        try {
          this.kuzzleStore.createEnvironment({
            id: name,
            environment: this.env[name],
          });
        } catch (e) {
          this.$log.error(e);
          this.errors.push(e);
        }
      }
      if (!this.errors.length) {
        this.$log.debug(`Finished import must switch: ${mustSwitch}, env:`);
        this.$log.debug(this.kuzzleStore.environments);
        if (!this.kuzzleStore.currentEnvironment) {
          this.$router.push({ name: 'SelectEnvironment' });
        }
        this.$bvModal.hide(this.id);
      }
    },
    upload() {
      if (!this.file || this.loading) {
        return;
      }
      this.$log.debug('Uploading!');

      this.errors = [];
      this.env = {};
      this.loading = true;
      const reader = new FileReader();

      if (this.file.type !== 'application/json') {
        this.errors.push(
          `⛔️ Uploaded file type (${this.file.type}) is not supported. Please import .json files only`,
        );
        this.loading = false;
        return;
      }

      reader.onload = (() => {
        return (e) => {
          try {
            this.env = JSON.parse(e.target.result);
          } catch (error) {
            this.$log.error(error);
            this.$log.debug(e.target);
            this.errors.push(error);
          }
          this.loading = false;
        };
      })(this.file);

      reader.readAsText(this.file);
    },
  },
};
</script>

<style></style>
