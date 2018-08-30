<template>
    <form @submit.prevent="tryClearCollection(index, collection)">
        <modal :id="id" additional-class="left-align" :is-open="isOpen" :close="close">
            <div class="row">
                <div class="col s12">
                    <h4>Clear <strong>{{collection}}</strong> collection</h4>
                    <div class="divider"></div>
                </div>
            </div>

            <div class="row">
                <div class="col s7">
                    <div class="input-field left-align">
                        <label for="collection-name">Confirm collection name</label>
                        <input id="collection-name" type="text" v-model="collectionConfirmation" :class="{'invalid': error}" v-focus>
                    </div>
                </div>

                <div class="col s5 error" v-if="error">
                    <div class="red-text">An error has occurred while deleting documents:</div>
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
                        :disabled="collection !== collectionConfirmation"
                        v-title="{active: collection === collectionConfirmation, position: 'left', title: 'Be careful. This action cannot be undone'}"
                        :class="{unauthorized: collection !== collectionConfirmation}"
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
import { CLEAR_COLLECTION } from '../../../vuex/modules/collection/mutation-types'
import Modal from '../../Materialize/Modal'
import Focus from '../../../directives/focus.directive'
import Title from '../../../directives/title.directive'

export default {
  name: 'ClearCollectionModal',
  props: {
    id: String,
    index: String,
    collection: String,
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
    refreshSearch() {
      if (parseInt(this.$route.query.from) === 0) {
        this.$router.push({ query: null })
      } else {
        this.$router.push({ query: { ...this.$route.query, from: 0 } })
      }
    },
    toggleTruncatedError() {
      this.errorTruncated = !this.errorTruncated
    },
    tryClearCollection() {
      if (!this.index.trim() || !this.collection.trim()) {
        return
      }

      this.$store
        .dispatch(CLEAR_COLLECTION, {
          index: this.index,
          collection: this.collection
        })
        .then(() => {
          this.collectionConfirmation = ''
          this.error = ''
          this.close()
          this.refreshSearch()
        })
        .catch(err => {
          this.error = err.message
        })
    }
  },
  data() {
    return {
      error: '',
      collectionConfirmation: '',
      errorTruncated: true
    }
  }
}
</script>
