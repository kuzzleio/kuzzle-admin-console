<template>
  <form @submit.prevent="confirmDeleteEnvironment">
    <modal id="delete-env" class="left-align" :close="close" :is-open="isOpen">
      <div class="row">
        <div class="col s12">
          <h4>Environment <strong>{{environmentName}}</strong> deletion</h4>
          <div class="divider"></div>
        </div>
      </div>

      <div class="row">
        <div class="col s7">
          <div class="input-field left-align">
            <label for="env-name">Confirm environment name</label>
            <input id="env-name" type="text" v-model="envConfirmation" v-focus>
          </div>
        </div>
      </div>

      <span slot="footer">
        <button
          type="submit"
          :disabled="environmentName !== envConfirmation"
          :class="{unauthorized: environmentName !== envConfirmation}"
          class="waves-effect btn">
            Delete
        </button>
        <button
          href="#!"
          class="btn-flat waves-effect waves-grey"
          @click.prevent="close">
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
        background-color: #EEE;
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
    props: ['environmentId', 'isOpen', 'close'],
    directives: {
      Focus
    },
    components: {
      Modal
    },
    computed: {
      environments () {
        return this.$store.state.kuzzle.environments
      }
    },
    data () {
      return {
        environmentName: null,
        envConfirmation: null
      }
    },
    methods: {
      confirmDeleteEnvironment () {
        if (this.environmentName === this.envConfirmation) {
          deleteEnvironment(this.environmentId)

          this.close()
          this.$router.push({name: 'Login'})
        }
      }
    },
    watch: {
      environmentId () {
        if (this.environmentId && this.environments[this.environmentId]) {
          this.environmentName = this.environments[this.environmentId].name
        }
      }
    }
  }
</script>
