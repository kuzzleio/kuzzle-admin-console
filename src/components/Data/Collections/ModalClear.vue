<template>
  <form @submit.prevent="tryClearCollection(index, collection)">
    <modal
      :id="id"
      additional-class="left-align"
      :is-open="isOpen"
      :close="close"
    >
      <div class="row">
        <div class="col s12">
          <h4>
            Clear <strong>{{ collection }}</strong> collection
          </h4>
          <div class="divider" />
        </div>
      </div>

      <div class="row">
        <div class="col s7">
          <div class="input-field left-align">
            <label for="collection-name">Confirm collection name</label>
            <input
              id="collection-name"
              v-model="collectionConfirmation"
              v-focus
              type="text"
              :class="{ invalid: error }"
            />
          </div>
        </div>

        <div v-if="error" class="col s5 error">
          <div class="red-text">
            An error has occurred while deleting documents:
          </div>
          <span :class="{ truncate: errorTruncated }">
            {{ error }}
          </span>
          <a @click.prevent="toggleTruncatedError()">
            <span v-if="errorTruncated"><a href="#">view more</a></span>
            <span v-if="!errorTruncated"><a href="#">view less</a></span>
          </a>
        </div>
      </div>

      <span slot="footer">
        <button
          v-title="{
            active: collection === collectionConfirmation,
            position: 'left',
            title: 'Be careful. This action cannot be undone'
          }"
          type="submit"
          :disabled="collection !== collectionConfirmation"
          :class="{ unauthorized: collection !== collectionConfirmation }"
          class="waves-effect btn"
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
  font-size: 1.3rem;
  line-height: 1.1;
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
  name: 'ClearCollectionModal',
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
    collection: String,
    isOpen: Boolean,
    close: Function
  },
  data() {
    return {
      error: '',
      collectionConfirmation: '',
      errorTruncated: true
    }
  },
  methods: {
    refreshSearch() {
      this.$router.go()
    },
    toggleTruncatedError() {
      this.errorTruncated = !this.errorTruncated
    },
    async tryClearCollection() {
      if (!this.index.trim() || !this.collection.trim()) {
        return
      }

      try {
        await this.$store.dispatch.collection.clearCollection({
          index: this.index,
          collection: this.collection
        })
        this.collectionConfirmation = ''
        this.error = ''
        this.close()
        this.refreshSearch()
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
