<template>
  <form
    class="CreateIndexModal"
    @submit.prevent="tryCreateIndex(index)"
  >
    <modal
      :id="id"
      :is-open="isOpen"
      :close="close"
    >
      <div class="row">
        <div class="col s12">
          <h4>Index creation</h4>
          <div class="divider" />
        </div>
      </div>

      <div class="row">
        <div class="col s7">
          <div class="input-field left-align">
            <label for="index-name">Index name</label>
            <input
              id="index-name"
              v-model="index"
              v-focus
              class="CreateIndexModal-name"
              type="text"
              :class="{'invalid': error}"
            >
          </div>
        </div>

        <div
          v-if="error"
          class="CreateIndexModal-error col s5 error"
        >
          <div class="red-text">
            An error has occurred during index creation:
          </div>
          <span :class="{'truncate': errorTruncated}">
            {{ error }}
          </span>
          <a
            href="#!"
            @click.prevent="toggleTruncatedError()"
          >
            <span v-if="errorTruncated">view more</span>
            <span v-if="!errorTruncated">view less</span>
          </a>
        </div>

        <div class="col s7">
          <span class="helper-text">The index name should contain only lowercase characters and cannot begin with an underscore (_)</span>
        </div>
      </div>

      <span slot="footer">
        <button
          type="submit"
          href="#!"
          class="CreateIndexModal-createBtn waves-effect btn"
        >
          Create
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
.helper-text {
  color: #aaa;
  font-style: italic;
  font-size: 0.9rem;
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
import { CREATE_INDEX } from '../../../vuex/modules/index/mutation-types'

export default {
  name: 'CreateIndexModal',
  directives: {
    Focus
  },
  components: {
    Modal
  },
  props: ['id', 'isOpen', 'close'],
  data() {
    return {
      error: '',
      index: '',
      errorTruncated: true
    }
  },
  methods: {
    toggleTruncatedError() {
      this.errorTruncated = !this.errorTruncated
    },
    async tryCreateIndex(index) {
      if (!index.trim()) {
        return
      }

      try {
        await this.$store.dispatch(CREATE_INDEX, index)
        this.index = ''
        this.error = ''
        this.close()
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
