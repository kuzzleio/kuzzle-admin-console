<template>
  <b-modal :id="id" @cancel="reset" @close="reset" @hide="reset">
    <template #modal-header>
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
        v-model="envConfirmation"
        data-cy="EnvironmentDeleteModal-envName"
        trim
        autofocus
        @keydown.enter="confirmDeleteEnvironment"
      />
    </b-form-group>

    <template #modal-footer>
      <b-button variant="secondary" @click="$bvModal.hide(id)"> Cancel </b-button>
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

<script>
import Focus from '@/directives/focus.directive';
import {
  KAuthActionsTypes,
  KKuzzleActionsTypes,
  KKuzzleGettersTypes,
  StoreNamespaceTypes,
} from '@/store';

export default {
  name: 'EnvironmentDeleteModal',
  directives: {
    Focus,
  },
  components: {},
  props: ['environmentId', 'id'],
  data() {
    return {
      envConfirmation: null,
    };
  },
  computed: {
    environments() {
      return this.$store.state.kuzzle.environments;
    },
    confirmationOk() {
      return this.environmentName !== null && this.environmentName === this.envConfirmation;
    },
    environmentName() {
      if (this.environmentId && this.environments[this.environmentId]) {
        return this.environments[this.environmentId].name;
      }
      return null;
    },
  },
  methods: {
    reset() {
      this.envConfirmation = null;
    },
    async confirmDeleteEnvironment() {
      if (this.confirmationOk) {
        if (
          this.$store.state.kuzzle.currentId === this.environmentId &&
          this.$store.state.kuzzle.online
        ) {
          await this.$store.dispatch(`${StoreNamespaceTypes.AUTH}/${KAuthActionsTypes.DO_LOGOUT}`);
        }

        this.$store.dispatch(
          `${StoreNamespaceTypes.KUZZLE}/${KKuzzleActionsTypes.DELETE_ENVIRONMENT}`,
          this.environmentId,
        );

        if (
          this.$store.getters[
            `${StoreNamespaceTypes.KUZZLE}/${KKuzzleGettersTypes.HAS_ENVIRONMENT}`
          ]
        ) {
          this.$router.push({ name: 'SelectEnvironment' });
        } else {
          this.$router.push({ name: 'CreateEnvironment' });
        }

        this.$bvModal.hide(this.id);
      }
    },
  },
};
</script>

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
