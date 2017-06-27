<template>
  <div class="wrapper">
    <headline>
      Edit user - <span class="bold">{{decodeURIComponent($store.state.route.params.id)}}</span>
    </headline>

    <div class="card-panel card-body">
      <div class="col s12">
        <tabs v-if="!loading" @tab-changed="switchTab" :active="activeTab" :object-tab-active="activeTabObject">
          <tab @tabs-on-select="setActiveTabObject" name="basic" tab-select="basic"><a href="">Basic</a></tab>
          <tab @tabs-on-select="setActiveTabObject" name="credentials" tab-select="basic"><a href="">Credentials</a></tab>
          <tab @tabs-on-select="setActiveTabObject" name="custom" tab-select="basic"><a href="">Custom</a></tab>
          <div slot="contents">
            <steps-content
              :step="stepNumber"
              :is-update="true"
            ></steps-content>
              <!--<basic-->
                <!--v-show="activeTab === 'basic'"-->
                <!--:added-profiles="addedProfiles"-->
                <!--:kuid="id"-->
                <!--@profile-add="onProfileAdded"-->
                <!--@profile-remove="onProfileRemoved"-->
              <!--&gt;</basic>-->
              <!--<credentials-selector-->
                <!--v-show="activeTab === 'credentials'"-->
                <!--:credentials="credentials"-->
                <!--:strategies="strategies"-->
                <!--:credentials-mapping="credentialsMapping"-->
                <!--@input="onCredentialsChanged"-->
              <!--&gt;</credentials-selector>-->
              <!--<custom-->
                <!--v-show="activeTab === 'custom'"-->
                <!--:value="content"-->
                <!--:mapping="contentMapping"-->
                <!--@input="onContentChanged"-->
              <!--&gt;</custom>-->
          </div>
        </tabs>
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
//  import kuzzle from '../../../services/kuzzle'
  import CredentialsEdit from '../Common/JsonWithMapping'
  import Tabs from '../../Materialize/Tabs'
  import Tab from '../../Materialize/Tab'
//  import Promise from 'bluebird'
  import StepsContent from './Steps/StepsContent'

  export default {
    name: 'UpdateUser',
    components: {
      Headline,
      CredentialsEdit,
      Tabs,
      Tab,
      StepsContent
    },
    data () {
      return {
        error: '',
        loading: false,
        id: null,
        refresh: false,
        activeTab: 'basic',
        activeTabObject: null,
        submitted: false
      }
    },
    computed: {
      stepNumber () {
        switch (this.activeTab) {
          case 'basic':
            return 0
          case 'credentials':
            return 1
          default:
            return 2
        }
      }
    },
    methods: {
      switchTab (name) {
        this.activeTab = name
      },
      setActiveTabObject (tab) {
        this.activeTabObject = tab
      },
//      validate () {
//        if (!this.autoGenerateKuid && !this.id) {
//          throw new Error('Please fill the custom KUID or check the auto-generate box')
//        }
//        if (!this.addedProfiles.length) {
//          throw new Error('Please add at least one profile to the user')
//        }
//        return true
//      },
//      save () {
//        try {
//          this.validate()
//        } catch (e) {
//          this.setError(e.message)
//          return
//        }
//        this.submitted = true
//
//        let userObject = {
//          profileIds: this.addedProfiles,
//          ...this.content
//        }
//        return kuzzle
//          .security
//          .replaceUserPromise(this.id, userObject)
//          .then(() => {
//            let promises = []
//            Object.keys(this.credentials).forEach(strategy => {
//              promises.push(
//                kuzzle
//                  .security
//                  .updateCredentialsPromise(
//                    strategy,
//                    this.id,
//                    this.credentials[strategy]
//                  )
//              )
//            })
//            return Promise.all(promises)
//          })
//          .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
//          .then(() => {
//            // The index refresh doesn't seem to work at the moment
//            return new Promise((resolve, reject) => {
//              setTimeout(() => { resolve() }, 1000)
//            })
//          })
//          .then(() => this.$router.push({name: 'SecurityUsersList'}))
//          .catch((err) => {
//            if (err) {
//              this.setError(err.message)
//              this.submitted = false
//            }
//          })
//      },
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
      onContentChanged (value) {
        this.content = value
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.push(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityUsersList'})
        }
      }
    }
  }
</script>
