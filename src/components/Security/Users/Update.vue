<template>
  <div class="wrapper">
    <headline>
      Edit user - <span class="bold">{{decodeURIComponent($store.state.route.params.id)}}</span>
    </headline>

    <create-or-update
      @document-create::create="update"
      @document-create::cancel="cancel"
      index="%kuzzle"
      collection="users"
      :hide-id="true"
      v-model="document">
    </create-or-update>
  </div>
</template>

<style scoped>
  .bold {
    font-weight: normal;
  }
</style>

<script>
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'
  import { getMappingUsers } from '../../../services/kuzzleWrapper'

  export default {
    name: 'UpdateUser',
    components: {
      Headline,
      CreateOrUpdate
    },
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        document: null
      }
    },
    methods: {
      getMappingUsers,
      update (user) {
        if (!user) {
          this.$store.commit(SET_TOAST, {text: 'Invalid document'})
          return
        }

        kuzzle
          .security
          .createUserPromise(decodeURIComponent(this.$store.state.route.params.id), user, {replaceIfExist: true})
          .then(() => {
            setTimeout(() => { // we can't perform refresh index on %kuzzle
              this.$router.push({name: 'SecurityUsersList'})
            }, 1000)
          })
          .catch((err) => {
            if (err) {
              this.$store.commit(SET_TOAST, {text: err.message})
            }
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityUsersList'})
        }
      }
    },
    mounted () {
      kuzzle
        .security
        .fetchUserPromise(decodeURIComponent(this.$store.state.route.params.id))
        .then((res) => {
          this.document = res.content
          this.$emit('document-create::fill', res.content)
          return null
        })
        .catch(err => {
          this.$store.commit(SET_TOAST, {text: err.message})
        })
    }
  }
</script>
