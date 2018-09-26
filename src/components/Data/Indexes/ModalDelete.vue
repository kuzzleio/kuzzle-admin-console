<template>
  <form class="IndexDeleteModal" @submit.prevent="tryDeleteIndex(index)">
    <modal :id="id" additional-class="left-align" :is-open="isOpen" :close="close">
      <div class="row">
        <div class="col s12">
          <h4>Index <strong>{{index}}</strong> deletion</h4>
          <div class="divider"></div>
        </div>
      </div>

      <div class="row">
        <div class="col s7">
          <div class="input-field left-align">
            <label for="index-name">Confirm index name</label>
            <input class="IndexDeleteModal-name" id="index-name" type="text" v-model="indexConfirmation" :class="{'invalid': error}" v-focus>
          </div>
        </div>

        <div class="col s5 error" v-if="error">
          <div class="red-text">An error has occurred during index deletion:</div>
          <span :class="{'truncate': errorTruncated}">
            {{error}}
          </span>
          <a @click.prevent="toggleTruncatedError()">
            <span v-if="errorTruncated">view more</span>
            <span v-if="!errorTruncated">view less</span>
          </a>
        </div>

      </div>

      <span slot="footer">
        <button
          type="submit"
          :disabled="index !== indexConfirmation"
          v-title="{active: index === indexConfirmation, position: 'left', title: 'Be careful. This action can not be undone'}"
          :class="{unauthorized: index !== indexConfirmation}"
          class="IndexDeleteModal-deleteBtn waves-effect btn">
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
    &.active {
      transform: translateY(-50%);
      font-size: 0.85rem;
    }
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
import { DELETE_INDEX } from '../../../vuex/modules/index/mutation-types'
import Modal from '../../Materialize/Modal'
import Focus from '../../../directives/focus.directive'
import Title from '../../../directives/title.directive'

export default {
  name: 'IndexDeleteModal',
  props: {
    id: String,
    index: String,
    isOpen: Boolean,
    close: Function
  },
  directives: {
    Focus,
    Title
  },
  components: {
    Modal
  },
  methods: {
    toggleTruncatedError() {
      this.errorTruncated = !this.errorTruncated
    },
    tryDeleteIndex(index) {
      if (!index.trim()) {
        return
      }

      this.$store
        .dispatch(DELETE_INDEX, index)
        .then(() => {
          this.indexConfirmation = ''
          this.error = ''
          this.close()
          this.$router.push({ name: 'Data' })
        })
        .catch(err => {
          this.error = err.message
        })
    }
  },
  data() {
    return {
      error: '',
      indexConfirmation: '',
      errorTruncated: true
    }
  }
}
</script>
