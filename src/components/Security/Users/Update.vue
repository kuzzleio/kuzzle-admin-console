<template>
  <div class="wrapper">
    <headline>
      Edit user - <span class="bold">{{decodeURIComponent($store.state.route.params.id)}}</span>
    </headline>

    <div class="col s12">
      <ul class="tabs">
        <li class="tab"><a href="#basic-tab">Basic</a></li>
        <li class="tab"><a href="#credentials-tab" @click="refreshAce">Credentials</a></li>
        <li class="tab"><a href="#content-tab">Content</a></li>
      </ul>
    </div>

    <div id="basic-tab" class="card-panel card-body">
      <basic
        @cancel="onCancel"
        @error="setError"
        @step-change="saveBasicData"
        @submit="onBasicSubmitted"
      ></basic>
    </div>

    <div id="content-tab">

    </div>

    <div id="credentials-tab">
      <update-credentials
        id="credentials"
        @document-create::create="update"
        @document-create::cancel="cancel"
        @document-create::error="setError"
        index="%kuzzle"
        collection="users"
        :hide-id="true"
        v-model="credentials"
        :mapping="credentialsMapping"
        id-mapping="credentialsMapping"
        id-content="credentialsMapping"
        :refresh-ace="refresh">
      </update-credentials>
    </div>

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
  import UpdateCredentials from '../Common/UpdatePluginAuthData'
  import Basic from './Steps/Basic'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'
  import {getMappingUsers} from '../../../services/kuzzleWrapper'
  import Vue from 'vue'

  export default {
    name: 'UpdateUser',
    components: {
      Headline,
      UpdateCredentials,
      Basic
    },
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        content: null,
        credentials: {},
        credentialsMapping: {},
        contentMapping: {},
        refresh: false
      }
    },
    methods: {
      update (user) {
        console.log('##', user)
//        if (!user) {
//          this.$store.commit(SET_TOAST, {text: 'Invalid document'})
//          return
//        }
//
//        kuzzle
//          .security
//          .updateUserPromise(decodeURIComponent(this.$store.state.route.params.id), user)
//          .then(() => {
//            setTimeout(() => { // we can't perform refresh index on %kuzzle
//              this.$router.push({name: 'SecurityUsersList'})
//            }, 1000)
//          })
//          .catch((err) => {
//            if (err) {
//              this.$store.commit(SET_TOAST, {text: err.message})
//            }
//          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityUsersList'})
        }
      },
      setError (payload) {
        this.error = payload
      },
      refreshAce () {
        this.refresh = !this.refresh
      }
    },
    mounted () {
      Vue.nextTick(() => {
        $(document).ready(() => {
          $('ul.tabs').tabs()
        })

        kuzzle
          .security
          .fetchUserPromise(decodeURIComponent(this.$store.state.route.params.id))
          .then((res) => {
            this.content = res.content

            kuzzle.queryPromise({controller: 'auth', action: 'getStrategies'}, {})
              .then(strategies => {
                strategies.result.forEach(strategy => {
                  kuzzle.security.getCredentialFieldsPromise(strategy)
                    .then(fields => {
                      Vue.set(this.credentialsMapping, strategy, fields)
                    })

                  kuzzle.security.getCredentialsPromise(strategy, this.$store.state.route.params.id)
                    .then(credential => {
                      if (credential) {
                        if (credential.kuid) {
                          delete credential.kuid
                        }
                        Vue.set(this.credentials, strategy, credential)
                      }
                    })
                    .catch(() => {
                    })
                })

                getMappingUsers()
                  .then(mapping => {
                    this.contentMapping = mapping
                  })
              })
          })
          .catch(err => {
            this.$store.commit(SET_TOAST, {text: err.message})
          })
      })
    }
  }
</script>
