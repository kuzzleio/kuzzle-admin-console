<template>
  <b-modal :id="id" @cancel="reset" @close="reset" @hide="reset">
    <template v-slot:modal-header>
      <h4>
        Environment <strong>{{ environmentName }}</strong> deletion
      </h4>
    </template>

    <b-form-group
      id="fieldset-1"
      description="This operation is not undoable."
      label="Confirm environment name"
      label-for="env-to-delete-name"
    >
      <b-form-input
        id="env-to-delete-name"
        data-cy="EnvironmentDeleteModal-envName"
        trim
        v-model="envConfirmation"
        @keydown.enter="confirmDeleteEnvironment"
      ></b-form-input>
    </b-form-group>

    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="$bvModal.hide(id)">
        Cancel
      </b-button>
      <b-button
        data-cy="EnvironmentDeleteModal-submit"
        variant="primary"
        :disabled="!confirmationOk"
        @click="confirmDeleteEnvironment"
      >
        OK
      </b-button>
    </template>
  </b-modal>
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
import Focus from '../../../directives/focus.directive'
import { deleteEnvironment } from '../../../services/environment'

export default {
  name: 'EnvironmentDeleteModal',
  directives: {
    Focus
  },
  components: {},
  props: ['environmentId', 'id'],
  data() {
    return {
      envConfirmation: null
    }
  },
  computed: {
    environments() {
      return this.$store.state.kuzzle.environments
    },
    confirmationOk() {
      return (
        this.environmentName !== null &&
        this.environmentName === this.envConfirmation
      )
    },
    environmentName() {
      if (this.environmentId && this.environments[this.environmentId]) {
        return this.environments[this.environmentId].name
      }
      return null
    }
  },
  methods: {
    reset() {
      this.envConfirmation = null
    },
    confirmDeleteEnvironment() {
      if (this.confirmationOk) {
        deleteEnvironment(this.environmentId)

        this.$bvModal.hide(this.id)
      }
    }
  }
}
</script>
