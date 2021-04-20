<template>
  <b-modal :id="id" @cancel="reset" @close="reset" @hide="reset">
    <template v-slot:modal-header>
      <h4>
        Environment <span class="code">{{ environmentName }}</span> deletion
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
        autofocus
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
    async confirmDeleteEnvironment() {
      if (this.confirmationOk) {
        if (this.$store.direct.state.kuzzle.currentId === this.environmentId) {
          await this.$store.direct.dispatch.auth.doLogout()
        }

        this.$store.direct.dispatch.kuzzle.deleteEnvironment(this.environmentId)

        if (this.$store.direct.getters.kuzzle.hasEnvironment) {
          this.$router.push({ name: 'SelectEnvironment' })
        } else {
          this.$router.push({ name: 'CreateEnvironment' })
        }

        this.$bvModal.hide(this.id)
      }
    }
  }
}
</script>
