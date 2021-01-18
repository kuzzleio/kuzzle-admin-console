<template>
  <b-modal
    data-cy="EnvironmentImport"
    ref="modal-import-env"
    title="Import Connection"
    :id="id"
    @cancel="reset"
    @close="reset"
    @hide="reset"
  >
    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="$bvModal.hide(id)">
        Cancel
      </b-button>
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
        data-cy="EnvironmentImport-fileInput"
        ref="file-input"
        v-model="file"
    /></b-form-group>

    <b-alert
      :show="file !== null && errors.length === 0 && !loading"
      data-cy="Environment-found"
    >
      ✅ Uploaded file is valid. Found {{ envNames.length }} connections.
    </b-alert>

    <b-alert
      v-for="(err, k) in errors"
      class="mt-3"
      dismissible
      show
      variant="danger"
      :key="k"
      >{{ err }}</b-alert
    >
  </b-modal>
</template>

<script>
export default {
  name: 'ModalImport',
  props: ['id'],
  components: {},
  data() {
    return {
      file: null,
      env: {},
      errors: [],
      loading: false
    }
  },
  computed: {
    envNames() {
      return Object.keys(this.env)
    }
  },
  methods: {
    clearFiles() {
      this.$refs['file-input'].reset()
    },
    reset() {
      this.clearFiles()
      this.errors = []
      this.env = {}
      this.loading = false
    },
    async importEnv() {
      let mustSwitch = false
      if (
        Object.keys(this.$store.direct.state.kuzzle.environments).length === 0
      ) {
        mustSwitch = true
      }
      for (const name in this.env) {
        try {
          this.$store.direct.dispatch.kuzzle.createEnvironment({
            id: name,
            environment: this.env[name]
          })
        } catch (e) {
          this.$log.error(e)
          this.errors.push(e)
        }
      }
      if (!this.errors.length) {
        this.$log.debug(`Finished import must switch: ${mustSwitch}, env:`)
        this.$log.debug(this.$store.direct.state.kuzzle.environments)
        if (!this.$store.direct.getters.kuzzle.currentEnvironment) {
          this.$router.push({ name: 'SelectEnvironment' })
        }
        this.$bvModal.hide(this.id)
      }
    },
    upload() {
      if (!this.file || this.loading) {
        return
      }
      this.$log.debug('Uploading!')

      this.errors = []
      this.env = {}
      this.loading = true
      const reader = new FileReader()

      reader.onload = (() => {
        return e => {
          try {
            this.env = JSON.parse(e.target.result)
          } catch (error) {
            this.$log.error(error)
            this.$log.debug(e.target)
            this.errors.push(error)
          }
          this.loading = false
        }
      })(this.file)

      reader.readAsText(this.file)
    }
  },
  watch: {
    file: {
      handler() {
        this.$log.debug('File has changed')
        this.upload()
      }
    }
  }
}
</script>

<style></style>
