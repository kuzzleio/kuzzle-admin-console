<template>
  <div>
    <basic
      v-if="step === 0"
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

    <custom-data
      v-show="step === 2"
      :mapping="customContentMapping"
      :value="customContent"
      @input="onCustomContentChanged"
    ></custom-data>
  </div>
</template>

<script>
import kuzzle from '../../../../services/kuzzle'
import { SET_TOAST } from '../../../../vuex/modules/common/toaster/mutation-types'
import { getMappingUsers } from '../../../../services/kuzzleWrapper'
import Basic from './Basic'
import CredentialsSelector from './CredentialsSelector'
import CustomData from './CustomData'

export default {
  name: 'StepsContent',
  props: ['step', 'isUpdate'],
  components: {
    Basic,
    CredentialsSelector,
    CustomData
  },
  data() {
    return {
      kuid: null,
      addedProfiles: [],
      autoGenerateKuid: false,
      credentials: {},
      strategies: [],
      credentialsMapping: {},
      customContent: {},
      customContentMapping: {}
    }
  },
  methods: {
    updateUser() {
      this.$emit('input', {
        kuid: this.kuid,
        autoGenerateKuid: this.autoGenerateKuid,
        addedProfiles: this.addedProfiles,
        credentials: this.credentials,
        customContent: this.customContent
      })
    },
    onProfileAdded(profile) {
      this.addedProfiles.push(profile)
      this.updateUser()
    },
    onProfileRemoved(profile) {
      this.addedProfiles.splice(this.addedProfiles.indexOf(profile), 1)
      this.updateUser()
    },
    setAutoGenerateKuid(value) {
      this.autoGenerateKuid = value
      this.updateUser()
    },
    setCustomKuid(value) {
      this.kuid = value
      this.updateUser()
    },
    onCredentialsChanged(payload) {
      this.credentials[payload.strategy] = { ...payload.credentials }
      this.updateUser()
    },
    onCustomContentChanged(value) {
      this.customContent = value
      this.updateUser()
    }
  },
  async mounted() {
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

      let { mapping } = await getMappingUsers()
      if (mapping) {
        this.customContentMapping = mapping
        delete this.customContentMapping.profileIds
      }

      if (this.isUpdate) {
        this.kuid = decodeURIComponent(this.$route.params.id)

        await Promise.all(
          this.strategies.map(async strategy => {
            const credentialsExists = await kuzzle.security.hasCredentialsPromise(strategy, this.kuid)

            if (!credentialsExists) {
              return
            }

            const strategyCredentials = await kuzzle.security.getCredentialsPromise(
              strategy,
              this.kuid
            )
            
            if (strategyCredentials.kuid) {
              delete strategyCredentials.kuid
            }

            this.$set(this.credentials, strategy, strategyCredentials)
          })
        )

        let { id, content } = await kuzzle.security.fetchUserPromise(this.kuid)
        this.id = id
        this.addedProfiles = content.profileIds
        delete content.profileIds
        this.customContent = { ...content }
      }

      this.loading = false
      this.updateUser()
    } catch (e) {
      this.$store.commit(SET_TOAST, { text: e.message })
    }
  }
}
</script>
