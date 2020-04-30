<template>
  <form class="IndexDeleteModal" @submit.prevent="tryDeleteIndex(index)">
    <modal
      :id="id"
      additional-class="left-align"
      :is-open="isOpen"
      :close="close"
    >
      <div class="row">
        <div class="col s12">
          <h4>
            Index <strong>{{ index }}</strong> deletion
          </h4>
          <div class="divider" />
        </div>
      </div>

      <div class="row">
        <div class="col s7">
          <div class="input-field left-align">
            <label for="index-name">Confirm index name</label>
            <input
              id="index-name"
              v-model="indexConfirmation"
              v-focus
              class="IndexDeleteModal-name"
              type="text"
              :class="{ invalid: error }"
            />
          </div>
        </div>

        <div v-if="error" class="col s5 error">
          <div class="red-text">
            An error has occurred during index deletion:
          </div>
          <span :class="{ truncate: errorTruncated }">
            {{ error }}
          </span>
          <a @click.prevent="toggleTruncatedError()">
            <span v-if="errorTruncated">view more</span>
            <span v-if="!errorTruncated">view less</span>
          </a>
        </div>
      </div>

      <span slot="footer">
        <button
          v-title="{
            active: index === indexConfirmation,
            position: 'left',
            title: 'Be careful. This action can not be undone'
          }"
          type="submit"
          :disabled="index !== indexConfirmation"
          :class="{ unauthorized: index !== indexConfirmation }"
          class="IndexDeleteModal-deleteBtn waves-effect btn"
        >
          Delete
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
import Modal from '../../Materialize/Modal'
import Focus from '../../../directives/focus.directive'
import Title from '../../../directives/title.directive'

export default {
  name: 'IndexDeleteModal',
  directives: {
    Focus,
    Title
  },
  components: {
    Modal
  },
  props: {
    id: String,
    index: String,
    isOpen: Boolean,
    close: Function
  },
  data() {
    return {
      error: '',
      indexConfirmation: '',
      errorTruncated: true
    }
  },
  methods: {
    toggleTruncatedError() {
      this.errorTruncated = !this.errorTruncated
    },
    tryDeleteIndex(index) {
      if (!index.trim()) {
        return
      }

      this.$store.direct.dispatch.index
        .deleteIndex(index)
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
  }
}
</script>
