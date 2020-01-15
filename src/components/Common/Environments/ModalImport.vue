<template>
  <b-modal
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
        variant="primary"
        :disabled="envNames.length === 0"
        @click="importEnv"
      >
        OK
      </b-button>
    </template>

    <b-form-file ref="file-input" @change="upload($event)" />

    <p v-if="envNames.length > 0" class="mt-3">
      Found {{ envNames.length }} connections
    </p>

    <b-alert
      v-for="(err, k) in errors"
      class="mt-3"
      dismissible
      show
      variant="danger"
      :key="k"
      >Error: {{ err }}</b-alert
    >
  </b-modal>
</template>

<script>
export default {
  name: 'ModalImport',
  props: ['id', 'isOpen'],
  components: {},
  data() {
    return {
      env: {},
      errors: []
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
    },
    importEnv() {
      for (const name in this.env) {
        try {
          this.$store.direct.dispatch.kuzzle.createEnvironment({
            id: name,
            environment: this.env[name]
          })
        } catch (e) {
          this.errors.push(e)
        }
      }
      if (!this.errors.length) {
        this.$bvModal.hide(this.id)
      }
    },
    upload(event) {
      var reader = new FileReader()

      reader.onload = (() => {
        return e => {
          this.errors = []
          this.env = JSON.parse(e.target.result)
          this.canSubmit = true
        }
      })(event.target.files[0])

      reader.readAsText(event.target.files[0])
    }
  }
}
</script>

<style></style>
