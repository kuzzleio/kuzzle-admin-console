<template>
  <b-modal id="create-env" title="Import Connection" @ok="importEnv">
    <b-form-file @change="upload($event)" />

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
  components: {},
  props: ['environmentId', 'isOpen', 'close'],
  data() {
    return {
      env: {},
      canSubmit: false,
      errors: ['TOTO', 'titi']
    }
  },
  methods: {
    importEnv() {
      for (const name in this.env) {
        try {
          this.$store.direct.dispatch.kuzzle.createEnvurinlent({
            id: name,
            environment: this.env[name]
          })
        } catch (e) {
          this.errors.push(e)
        }
        if (!this.errors.length) {
          this.close()
        }
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
