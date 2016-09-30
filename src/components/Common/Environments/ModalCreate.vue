<template>
  <form @submit.prevent="createEnvironments">
    <modal id="create-env" class="modal-fixed-footer">
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
            <input id="ioport" type="number" v-model="environment.ioPort" required :class="{invalid: errors.ioPort}">
            <label for="ioport" :class="{'active': environment.ioPort}" data-error="ioPort must be an integer between 1000 and 9999">ioPort</label>
          </div>
        </div>
      </div>

      <div class="row last-row">
        <div class="col s12">
          <div class="input-field left-align">
            <input id="wsport" type="number" v-model="environment.wsPort" required :class="{invalid: errors.wsPort}">
            <label for="wsport" :class="{'active': environment.wsPort}" data-error="wsPort must be an integer between 1000 and 9999">wsPort</label>
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
            <div class="col s3" v-for="color in colors">
              <div class="color card valign-wrapper"
                   :style="{backgroundColor: color}"
                   @click="selectColor($index)">
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
        <button class="btn-flat waves-effect waves-grey" @click.prevent="$broadcast('modal-close', 'create-env')">
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
        font-family: "Roboto", sans-serif;
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
  import { createEnvironment, updateEnvironment } from '../../../services/environment'
  import { environments } from '../../../vuex/modules/common/kuzzle/getters'

  export default {
    name: 'EnvironmentsCreateModal',
    props: ['environmentId'],
    components: {
      Modal
    },
    directives: {
      Focus
    },
    vuex: {
      getters: {
        environments
      }
    },
    data () {
      return {
        errors: {
          wsPort: false,
          ioPort: false,
          host: false
        },
        environment: {
          name: null,
          host: null,
          ioPort: 7512,
          wsPort: 7513,
          color: '#00757F'
        },
        colors: ['#00757F', '#dc2222', '#7f6500', '#ccaa2a', '#537f00', '#000f7f', '#6d007f', '#7f0045']
      }
    },
    methods: {
      createEnvironments () {
        this.errors.name = (!this.environment.name)
        this.errors.wsPort = (!this.environment.wsPort || this.environment.wsPort < 1000 || this.environment.wsPort > 9999)
        this.errors.ioPort = (!this.environment.ioPort || this.environment.ioPort < 1000 || this.environment.ioPort > 9999)
        // Host is required and must be something like 'mydomain.com/toto'
        this.errors.host = (!this.environment.host || /^(http|ws):\/\//.test(this.environment.host))

        if (!this.errors.name && !this.errors.wsPort && !this.errors.ioPort && !this.errors.host) {
          if (this.environmentId) {
            updateEnvironment(this.environmentId, this.environment.name, this.environment.color, this.environment.host, this.environment.ioPort, this.environment.wsPort)
          } else {
            createEnvironment(this.environment.name, this.environment.color, this.environment.host, this.environment.ioPort, this.environment.wsPort)
          }

          this.$broadcast('modal-close', 'create-env')
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
          this.environment.ioPort = this.environments[this.environmentId].ioPort
          this.environment.wsPort = this.environments[this.environmentId].wsPort
          this.environment.color = this.environments[this.environmentId].color
        } else {
          this.environment.name = null
          this.environment.host = null
          this.environment.ioPort = 7512
          this.environment.wsPort = 7513
          this.environment.color = '#00757F'
        }
      }
    }
  }
</script>
