<template>
  <form @submit.prevent="createEnvironments">
    <modal id="create-env" :footer-fixed="true" :is-open="isOpen" :close="close">
      <div class="row">
        <div class="col s12">
          <h4>{{environmentId ? 'Update' : 'Create'}} environment</h4>
          <div class="divider"></div>
        </div>
      </div>

      <div class="row">
        <div class="col s12">
          <div class="input-field left-align">
            <input id="env-name" type="text" v-model="environment.name" v-focus required :class="{invalid: errors.name}">
            <label for="env-name" :class="{'active': environment.name}" data-error="Name is required">Name</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col s12">
          <div class="input-field left-align">
            <input id="host" type="text" v-model="environment.host" required :class="{invalid: errors.host}">
            <label for="host" :class="{'active': environment.host}" data-error="The host must be something like 'mydomain.com'">Host</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col s12">
          <div class="input-field left-align">
            <input id="port" type="number" v-model="environment.port" required :class="{invalid: errors.port}">
            <label for="port" :class="{'active': environment.port}" data-error="port number must be an integer">port</label>
          </div>
        </div>
      </div>

      <div class="row color-picker">
        <div class="col s12">
          <div class="input-field left-align">
            <p>Color</p>
          </div>
        </div>
        <div class="col s12">
          <div class="row">
            <div class="col s6 m3" v-for="(color, index) in colors">
              <div class="color card valign-wrapper"
                   :style="{backgroundColor: color}"
                   @click="selectColor(index)">
                <span class="selected valign center-align" v-if="environment.color === color">Selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span slot="footer">
        <button type="submit" class="waves-effect btn">
            {{environmentId ? 'Update' : 'Create'}}
        </button>
        <button class="btn-flat waves-effect waves-grey" @click.prevent="close">
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
      width: 100%;
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
  .last-row {
    margin-bottom: 5px;
  }
  .color-picker {
    p {
      color: #9e9e9e;
    }
    .color {
      display: block;
      text-align: center;
      cursor: pointer;
      height: 60px;

      &:hover {
        box-shadow: 5px 10px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
      }
      .selected {
        margin-top: 15px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        font-size: 1.2em;
        font-weight: normal;
        color: #fff;
        display: inline-block;
      }
    }
  }
</style>

<script>
  import Modal from '../../Materialize/Modal'
  import Focus from '../../../directives/focus.directive'
  import { createEnvironment, DEFAULT_COLOR } from '../../../services/environment'
  import { UPDATE_ENVIRONMENT } from '../../../vuex/modules/common/kuzzle/mutation-types'

  export default {
    name: 'EnvironmentsCreateModal',
    props: ['environmentId', 'isOpen', 'close'],
    components: {
      Modal
    },
    directives: {
      Focus
    },
    computed: {
      environments () {
        return this.$store.state.kuzzle.environments
      }
    },
    data () {
      return {
        errors: {
          port: false,
          host: false
        },
        environment: {
          name: null,
          host: null,
          port: 7512,
          color: DEFAULT_COLOR
        },
        colors: [DEFAULT_COLOR, '#0277bd', '#8e24aa', '#689f38', '#f57c00', '#e53935', '#546e7a', '#d81b60']
      }
    },
    methods: {
      createEnvironments () {
        this.errors.name = (!this.environment.name)
        this.errors.port = (!this.environment.port || typeof this.environment.port !== 'number')
        // Host is required and must be something like 'mydomain.com/toto'
        this.errors.host = (!this.environment.host || /^(http|ws):\/\//.test(this.environment.host))

        if (!this.errors.name && !this.errors.port && !this.errors.host) {
          if (this.environmentId) {
            this.$store.dispatch(UPDATE_ENVIRONMENT, {
              id: this.environmentId,
              environment: {
                name: this.environment.name,
                color: this.environment.color,
                host: this.environment.host,
                port: this.environment.port
              }
            })
          } else {
            createEnvironment(
              this.environment.name,
              this.environment.color,
              this.environment.host,
              this.environment.port)
          }

          this.close()
        }
      },
      selectColor (index) {
        this.environment.color = this.colors[index]
      }
    },
    watch: {
      environmentId () {
        if (this.environmentId && this.environments[this.environmentId]) {
          this.environment.name = this.environments[this.environmentId].name
          this.environment.host = this.environments[this.environmentId].host
          this.environment.port = this.environments[this.environmentId].port
          this.environment.color = this.environments[this.environmentId].color
        } else {
          this.environment.name = null
          this.environment.host = null
          this.environment.port = 7512
          this.environment.color = DEFAULT_COLOR
        }
      }
    }
  }
</script>
