<template>
  <div>
    <basic
      v-show="step === 0"
      :edit-kuid="!isUpdate"
      :added-profiles="addedProfiles"
      :auto-generate-kuid="autoGenerateKuid"
      :kuid="kuid"
      @set-auto-generate-kuid="setAutoGenerateKuid"
      @set-custom-kuid="setCustomKuid"
      @profile-add="onProfileAdded"
      @profile-remove="onProfileRemoved"
    ></basic>

    <credentials-selector
      v-show="step === 1"
      @input="onCredentialsChanged"
      :credentials="credentials"
      :strategies="strategies"
      :credentials-mapping="credentialsMapping"
    ></credentials-selector>

    <custom
      v-show="step === 2"
      :mapping="customContentMapping"
      :value="customContent"
      @input="onCustomContentChanged"
    ></custom>
  </div>
</template>

<script>
  import Vue from 'vue'
  import kuzzle from '../../../../services/kuzzle'
  import {SET_TOAST} from '../../../../vuex/modules/common/toaster/mutation-types'
  import {getMappingUsers} from '../../../../services/kuzzleWrapper'
  import Basic from './Basic'
  import CredentialsSelector from './CredentialsSelector'
  import Custom from './Custom'

  export default {
    name: 'StepsContent',
    props: ['step', 'isUpdate'],
    components: {
      Basic,
      CredentialsSelector,
      Custom
    },
    data () {
      return {
        id: null,
        addedProfiles: [],
        autoGenerateKuid: false,
        credentials: {},
        strategies: [],
        credentialsMapping: {},
        customContent: {},
        customContentMapping: {}
      }
    },
    computed: {
      kuid () {
        if (this.$store.state.route && this.$store.state.route.params && this.$store.state.route.params.id) {
          return this.$store.state.route.params.id
        }

        return null
      }
    },
    methods: {
      onProfileAdded (profile) {
        this.addedProfiles.push(profile)
      },
      onProfileRemoved (profile) {
        this.addedProfiles.splice(this.addedProfiles.indexOf(profile), 1)
      },
      setAutoGenerateKuid (value) {
        this.autoGenerateKuid = value
      },
      setCustomKuid (value) {
        this.id = value
      },
      onCredentialsChanged (payload) {
        this.credentials[payload.strategy] = {...payload.credentials}
      },
      onCustomContentChanged (value) {
        this.customContent = value
      }
    },
    mounted () {
      Vue.nextTick(async () => {
        this.loading = true

        try {
          let credentialsMapping = await kuzzle.security.getAllCredentialFieldsPromise()
          this.strategies = Object.keys(credentialsMapping)

          // Clean "kuid" from credentialsMapping
          this.strategies.forEach(strategy => {
            if (credentialsMapping[strategy].kuid) {
              delete credentialsMapping[strategy].kuid
            }
          })
          this.credentialsMapping = credentialsMapping

          let {mapping} = await getMappingUsers()
          if (mapping) {
            this.customContentMapping = mapping
            delete this.customContentMapping.profileIds
          }

          if (this.isUpdate) {
            await Promise.all(this.strategies.map(async (strategy) => {
              let strategyCredentials = await kuzzle.security.getCredentialsPromise(strategy, this.kuid)
              if (strategyCredentials.kuid) {
                delete strategyCredentials.kuid
              }

              this.$set(this.credentials, strategy, strategyCredentials)
            }))
          }

          this.loading = false
        } catch (e) {
          this.$store.commit(SET_TOAST, {text: e.message})
        }

//        return kuzzle.queryPromise({controller: 'auth', action: 'getStrategies'}, {})
//          .then(res => {
//            this.strategies = res.result
//
//            let promises = this.strategies.map(strategy => {
//              return kuzzle.security.getCredentialFieldsPromise(strategy)
//                .then(fields => {
//                  this.$set(this.credentialsMapping, strategy, fields)
//                  return kuzzle.security.getCredentialsPromise(strategy, this.id)
//                })
//                .then(credential => {
//                  if (credential) {
//                    if (credential.kuid) {
//                      delete credential.kuid
//                    }
//                    this.$set(this.credentials, strategy, credential)
//                  }
//
//                })
//            })
//
//            return Promise.all(promises)
//          })
//          .then(() => {
//            if (this.isUpdate) {
//              return kuzzle
//                .security
//                .fetchUserPromise(decodeURIComponent(this.$store.state.route.params.id))
//                .then((res) => {
//                  this.id = res.id
//                  this.addedProfiles = res.content.profileIds
//                  delete res.content.profileIds
//                  this.customContent = {...res.content}
//                })
//            }
//
//            return Promise.resolve()
//          })
//          .catch(err => {
//            this.$store.commit(SET_TOAST, {text: err.message})
//          })
      })
    }
  }
</script>
