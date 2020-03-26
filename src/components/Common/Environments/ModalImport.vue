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

    <b-form-file ref="file-input" @change="upload($event)" />

    <p class="mt-3" data-cy="Environment-found">
      Found {{ envNames.length }} connections
    </p>

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
        if (
          mustSwitch &&
          Object.keys(this.$store.direct.state.kuzzle.environments).length > 0
        ) {
          await this.$store.direct.dispatch.kuzzle.switchEnvironment(
            Object.keys(this.$store.direct.state.kuzzle.environments)[0]
          )
          this.$router.push({ name: 'SelectEnvironment' })
        }
        this.$bvModal.hide(this.id)
      }
    },
    upload(event) {
      this.errors = []
      this.env = {}
      var reader = new FileReader()

      reader.onload = (() => {
        return e => {
          try {
            this.env = JSON.parse(e.target.result)

            this.canSubmit = true
          } catch (error) {
            this.$log.error(error)
            this.$log.debug(e.target)

            this.errors.push(error)
          }
        }
      })(event.target.files[0])
      this.$log.debug(event)

      reader.readAsText(event.target.files[0])
    }
  }
}
</script>

<style></style>
