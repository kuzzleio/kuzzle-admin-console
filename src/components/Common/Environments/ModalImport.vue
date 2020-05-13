<template>
  <form class="EnvironmentsImportModal" @submit.prevent="importEnv">
    <modal
      id="create-env"
      :footer-fixed="true"
      :is-open="isOpen"
      :close="close"
    >
      <div class="row">
        <div class="col s12">
          <h4>Import Connection</h4>
          <div class="divider" />
        </div>
      </div>

      <input type="file" @change="upload($event)" />

      <div v-for="(err, k) in errors" :key="k" class="card-panel red lighten-3">
        <span>Error: {{ err }}</span>
      </div>

      <span slot="footer">
        <button
          :class="{ disabled: !canSubmit }"
          type="submit"
          class="EnvironmentsCreateModal-import Environment-SubmitButton waves-effect btn"
        >
          Import
        </button>
        <button class="btn-flat waves-effect waves-grey" @click.prevent="close">
          Cancel
        </button>
      </span>
    </modal>
  </form>
</template>

<script>
import Modal from '../../Materialize/Modal'

export default {
  name: 'ModalImport',
  components: {
    Modal
  },
  props: ['environmentId', 'isOpen', 'close'],
  data() {
    return {
      env: {},
      canSubmit: false,
      errors: []
    }
  },
  methods: {
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
