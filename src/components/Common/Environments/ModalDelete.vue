<template>
  <form
    class="EnvironmentDeleteModal"
    @submit.prevent="confirmDeleteEnvironment"
  >
    <modal
      id="delete-env"
      additional-class="left-align"
      :close="close"
      :is-open="isOpen"
    >
      <div class="row">
        <div class="col s12">
          <h4>Environment <strong>{{ environmentName }}</strong> deletion</h4>
          <div class="divider" />
        </div>
      </div>

      <div class="row">
        <div class="col s7">
          <div class="input-field left-align">
            <label for="env-to-delete-name">Confirm environment name</label>
            <input
              id="env-to-delete-name"
              v-model="envConfirmation"
              v-focus
              class="EnvironmentDeleteModal-envName"
              type="text"
            >
          </div>
        </div>
      </div>

      <span slot="footer">
        <button
          type="submit"
          :disabled="environmentName !== envConfirmation"
          :class="{unauthorized: environmentName !== envConfirmation}"
          class="EnvironmentDeleteModal-submit waves-effect btn"
        >
          Delete
        </button>
        <button
          href="#!"
          class="btn-flat waves-effect waves-grey"
          @click.prevent="close"
        >
          Cancel
        </button>
      </span>
    </modal>
  </form>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
.error {
  strong {
    display: block;
  }
}
.input-field {
  label {
    left: 0;
  }
}
button {
  &.btn-flat {
    &:focus {
      background-color: #eee;
    }
  }
}
</style>

<script>
import Modal from '../../Materialize/Modal'
import Focus from '../../../directives/focus.directive'
import { deleteEnvironment } from '../../../services/environment'

export default {
  name: 'EnvironmentDeleteModal',
  directives: {
    Focus
  },
  components: {
    Modal
  },
  props: ['environmentId', 'isOpen', 'close'],
  data() {
    return {
      environmentName: null,
      envConfirmation: null
    }
  },
  computed: {
    environments() {
      return this.$store.state.kuzzle.environments
    }
  },
  watch: {
    environmentId() {
      if (this.environmentId && this.environments[this.environmentId]) {
        this.environmentName = this.environments[this.environmentId].name
      }
    },
    isOpen() {
      this.envConfirmation = null
    }
  },
  methods: {
    confirmDeleteEnvironment() {
      if (this.environmentName === this.envConfirmation) {
        deleteEnvironment(this.environmentId)

        this.close()
      }
    }
  }
}
</script>
