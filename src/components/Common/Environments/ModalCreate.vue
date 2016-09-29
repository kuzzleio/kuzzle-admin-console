<template>
  <form @submit.prevent="createEnvironments">
    <modal id="create-env" class="modal-fixed-footer">
      <div class="row">
        <div class="col s12">
          <h4>Environment creation</h4>
          <div class="divider"></div>
        </div>
      </div>

      <div class="row">
        <div class="col s12">
          <div class="input-field left-align">
            <input id="env-name" type="text" v-model="environment.name" v-focus required>
            <label for="env-name" :class="{'active': environment.name}">Name</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col s12">
          <div class="input-field left-align">
            <input id="host" type="text" v-model="environment.host" required>
            <label for="host" :class="{'active': environment.host}">Host</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col s12">
          <div class="input-field left-align">
            <input id="ioport" type="number" v-model="environment.ioPort" required>
            <label for="ioport" :class="{'active': environment.ioPort}">ioPort</label>
          </div>
        </div>
      </div>

      <div class="row last-row">
        <div class="col s12">
          <div class="input-field left-align">
            <input id="wsport" type="number" v-model="environment.wsPort" required>
            <label for="wsport" :class="{'active': environment.wsPort}">wsPort</label>
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
            Create
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
  import { createEnvironment } from '../../../services/environment'

  export default {
    name: 'EnvironmentsCreateModal',
    components: {
      Modal
    },
    directives: {
      Focus
    },
    data () {
      return {
        error: null,
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
        createEnvironment(this.environment.name, this.environment.color, this.environment.host, this.environment.ioPort, this.environment.wsPort)
      },
      selectColor (index) {
        this.environment.color = this.colors[index]
      }
    }
  }
</script>
