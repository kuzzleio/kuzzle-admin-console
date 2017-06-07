<template>
  <div class="wrapper">
    <headline>
      Edit user - <span class="bold">{{decodeURIComponent($store.state.route.params.id)}}</span>
    </headline>

    <div class="card-panel card-body">
      <div class="col s12">
        <ul class="tabs">
          <li class="tab"><a href="#basic-tab">Basic</a></li>
          <li class="tab"><a href="#credentials-tab" @click="refreshAce">Credentials</a></li>
          <li class="tab"><a href="#content-tab">Content</a></li>
        </ul>
      </div>
      <div id="basic-tab">
        <basic
          v-if="!loading"
          :added-profiles="addedProfiles"
          :kuid="id"
          @profile-add="onProfileAdded"
          @profile-remove="onProfileRemoved"
        ></basic>
      </div>
      <div id="credentials-tab">
        <update-credentials
          v-if="!loading"
          id-mapping="credentialsMapping"
          id-content="credentialsMapping"
          :value="credentials"
          :refresh-ace="refresh"
          :mapping="credentialsMapping"
          @input="onCredentialsChanged"
        ></update-credentials>
      </div>
      <div id="content-tab">
        <custom
          v-if="!loading"
          :value="content"
          :mapping="contentMapping"
          @input="onContentChanged"
        ></custom>
      </div>

      <!-- Actions -->
      <div class="row">
        <div class="col s3">
          <a
            tabindex="6"
            class="btn-flat waves-effect"
            @click.prevent="cancel"
          >Cancel</a>
          <button
            type="submit"
            class="btn primary waves-effect waves-light"
            @click.prevent="save"
          >Save</button>
        </div>
        <div class="col s9">
          <div v-if="error" class="card error red-color white-text">
            <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
            {{error}}
          </div>
        </div>
      </div>
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
  import UpdateCredentials from '../Common/CreateOrUpdatePluginAuthData'
  import Basic from './Steps/Basic'
  import Custom from './Steps/Custom'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'
  import {getMappingUsers} from '../../../services/kuzzleWrapper'
  import Vue from 'vue'
  import Promise from 'bluebird'

  export default {
    name: 'UpdateUser',
    components: {
      Headline,
      UpdateCredentials,
      Basic,
      Custom
    },
    data () {
      return {
        error: '',
        loading: false,
        id: null,
        addedProfiles: [],
        credentials: {},
        content: {},
        credentialsMapping: {},
        contentMapping: {},
        refresh: false
      }
    },
    methods: {
      validate () {
        if (!this.autoGenerateKuid && !this.id) {
          throw new Error('Please fill the custom KUID or check the auto-generate box')
        }
        if (!this.addedProfiles.length) {
          throw new Error('Please add at least one profile to the user')
        }
        return true
      },
      onProfileAdded (profile) {
        this.addedProfiles.push(profile)
      },
      onProfileRemoved (profile) {
        this.addedProfiles.splice(this.addedProfiles.indexOf(profile), 1)
      },
      save () {
        try {
          this.validate()
        } catch (e) {
          this.setError(e.message)
          return
        }
        let userObject = {
          profileIds: this.addedProfiles,
          ...this.content
        }
        return kuzzle
          .security
          .updateUserPromise(this.id, userObject)
          .then(() => {
            let promises = []
            Object.keys(this.credentials).forEach(strategy => {
              promises.push(
                kuzzle
                  .security
                  .updateCredentialsPromise(
                    strategy,
                    this.id,
                    this.credentials[strategy]
                  )
              )
            })
            return Promise.all(promises)
          })
          .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
          .then(() => {
            // The index refresh doesn't seem to work at the moment
            return new Promise((resolve, reject) => {
              setTimeout(() => { resolve() }, 1000)
            })
          })
          .then(() => this.$router.push({name: 'SecurityUsersList'}))
          .catch((err) => {
            if (err) {
              this.setError(err.message)
            }
          })
      },
      setError (msg) {
        this.error = msg
        setTimeout(() => {
          this.dismissError()
        }, 5000)
      },
      dismissError () {
        this.error = ''
      },
      refreshAce () {
        this.refresh = !this.refresh
      },
      onCredentialsChanged (value) {
        this.credentials = value
      },
      onContentChanged (value) {
        this.content = value
      }
    },
    mounted () {
      Vue.nextTick(() => {
        $(document).ready(() => {
          $('ul.tabs').tabs()
        })

        this.loading = true

        return kuzzle
          .security
          .fetchUserPromise(decodeURIComponent(this.$store.state.route.params.id))
          .then((res) => {
            this.id = res.id
            this.addedProfiles = res.content.profileIds
            delete res.content.profileIds
            this.content = {...res.content}

            return kuzzle.queryPromise({controller: 'auth', action: 'getStrategies'}, {})
              .then(strategies => {
                strategies.result.forEach(strategy => {
                  kuzzle.security.getCredentialFieldsPromise(strategy)
                    .then(fields => {
                      Vue.set(this.credentialsMapping, strategy, fields)
                    })

                  return kuzzle.security.getCredentialsPromise(strategy, this.id)
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

                return getMappingUsers()
                  .then(response => {
                    if (!response.mapping || !response.mapping.content) {
                      this.contentMapping = {}
                    } else {
                      this.contentMapping = response.mapping.content.properties
                    }
                    this.loading = false
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
