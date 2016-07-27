<template>
  <modal :id="id">
    <div class="row">
      <div class="col s12">
        <h4>Index creation</h4>
        <div class="divider"></div>
      </div>
    </div>


    <div class="row">
      <div class="col s8">
        <div class="input-field left-align">
          <label for="index-name">Index name</label>
          <input id="index-name" type="text" :class="{'invalid': error}">
        </div>
      </div>

      <div class="col s4 error" v-if="error">
        <div class="red-text">An error has occured during index creation:</div>
        <span :class="{'truncate': errorTruncated}">
          {{error.message}}
        </span>
        <a href="#!" @click.prevent="toggleTruncatedError()">
          <span v-if="errorTruncated">view more</span>
          <span v-if="!errorTruncated">view less</span>
        </a>
      </div>

    </div>

    <span slot="footer">
      <button
        href="#!"
        class="waves-effect btn">
          Create
      </button>
      <button
        href="#!"
        class="btn-flat waves-effect waves-grey"
        @click.prevent="$broadcast('modal-close', id)">
          Cancel
      </button>
    </span>
  </modal>
</template>

<style lang="scss" scoped>
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
  import Modal from '../../Materialize/Modal.vue'

  export default {
    name: 'IndexCreateModal',
    props: ['id'],
    components: {
      Modal
    },
    methods: {
      toggleTruncatedError () {
        this.errorTruncated = !this.errorTruncated
      }
    },
    data () {
      return {
        errorTruncated: true,
        error: {
          message: 'Illa re sermonum sed oportet sed atque quaedam quidem liberior oportet amicitia severitas mediocre remissior' +
          'debet illa morum condimentum et omnem dulcior quaedam haudquaquam esse et illa esse gravitatem gravitatem.'
        }
      }
    }
  }
</script>
