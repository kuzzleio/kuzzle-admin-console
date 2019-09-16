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
    />

    <credentials-selector
      v-show="step === 1"
      :credentials="credentials"
      :strategies="strategies"
      :credentials-mapping="credentialsMapping"
      @input="onCredentialsChanged"
    />

    <custom-data
      v-show="step === 2"
      :mapping="customContentMapping"
      :value="customContent"
      @input="onCustomContentChanged"
    />
  </div>
</template>

<script>
import { SET_TOAST } from '../../../../vuex/modules/common/toaster/mutation-types'
import { getMappingUsers } from '../../../../services/kuzzleWrapper'
import Basic from './Basic'
import CredentialsSelector from './CredentialsSelector'
import CustomData from './CustomData'

export default {
  name: 'StepsContent',
  components: {
    Basic,
    CredentialsSelector,
    CustomData
  },
  props: ['step', 'isUpdate'],
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
  async mounted() {
    this.loading = true

    try {
      let credentialsMapping = await this.$kuzzle.security.getAllCredentialFields()
      this.strategies = Object.keys(credentialsMapping)

      // Clean "kuid" from credentialsMapping
      this.strategies.forEach(strategy => {
        if (credentialsMapping[strategy].kuid) {
          delete credentialsMapping[strategy].kuid
        }
      })
      this.credentialsMapping = credentialsMapping

      const { mapping } = await getMappingUsers()
      if (mapping) {
        this.customContentMapping = mapping
        delete this.customContentMapping.profileIds
      }

      if (this.isUpdate) {
        this.kuid = this.$route.params.id

        await Promise.all(
          this.strategies.map(async strategy => {
            const credentialsExists = await this.$kuzzle.security.hasCredentials(strategy, this.kuid)

            if (!credentialsExists) {
              return
            }

            let strategyCredentials = await this.$kuzzle.security.getCredentials(
              strategy,
              this.kuid
            )
            
            if (strategyCredentials.kuid) {
              delete strategyCredentials.kuid
            }

            this.$set(this.credentials, strategy, strategyCredentials)
          })
        )

        let { _id, content } = await this.$kuzzle.security.getUser(this.kuid)
        this.id = _id
        this.addedProfiles = content.profileIds
        delete content.profileIds
        this.customContent = { ...content }
      }

      this.loading = false
      this.updateUser()
    } catch (e) {
      this.$store.commit(SET_TOAST, { text: e.message })
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
  }
}
</script>
