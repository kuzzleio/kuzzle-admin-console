<template>
  <form class="wrapper" @submit.prevent="submit">
    <div class="row">
      <div class="col s3">
        <strong>KUID</strong>
      </div>

      <div class="col s9">
        <input
          type="checkbox"
          class="filled-in"
          tabindex="2"
          id="user-auto-generate-kuid"
          :checked="autoGenerateKUID"
          @change="setAutoGenerateKUID"
          />
        <label for="user-auto-generate-kuid">
          Auto-generate
        </label>
        <input v-if="!autoGenerateKUID" v-model="customKUID" placeholder="Custom KUID" id="custom-kuid" type="text" class="validate" required>
      </div>
    </div class="row">
    <div class="row">
      <div class="col s3">
        <strong>Profiles</strong>
      </div>
      <div class="col s9">
        <user-profile-list
          :added-profiles="addedProfiles"
          @selected-profile="onProfileSelected"
          @remove-profile="removeProfile"
        ></user-profile-list>
      </div>
    </div>
    <!-- Actions -->
    <div class="row">
      <div class="col s3">
        <a tabindex="6" class="btn-flat waves-effect" @click.prevent="$emit('cancel')">Cancel</a>
        <button type="submit" class="btn primary waves-effect waves-light">
          Next
        </button>
      </div>
      <div class="col s9">
        <div v-if="error" class="card error red-color white-text">
          <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
          {{error}}
        </div>
      </div>
    </div>
  </form>
</template>

<script type="text/javascript">
import UserProfileList from './UserProfileList'

export default {
  name: 'UserBasicData',
  components: {
    UserProfileList
  },
  props: {
    step: Number
  },
  data () {
    return {
      autoGenerateKUID: true,
      customKUID: null,
      addedProfiles: [],
      error: ''
    }
  },
  computed: {
    dataPayload () {
      return {
        autoGenerateKUID: this.autoGenerateKUID,
        customKUID: this.customKUID,
        addedProfiles: this.addedProfiles
      }
    }
  },
  methods: {
    setAutoGenerateKUID (event) {
      this.autoGenerateKUID = event.target.checked
    },
    onProfileSelected (profile) {
      this.addedProfiles.push(profile)
    },
    removeProfile (profile) {
      this.addedProfiles.splice(this.addedProfiles.indexOf(profile), 1)
    },
    submit () {
      if (!this.autoGenerateKUID && !this.customKUID) {
        this.setError('Please provide a custom KUID or select the auto-generate checkbox.')
        return
      }
      if (!this.addedProfiles.length) {
        this.setError('Please select at least one profile.')
        return
      }
      this.$emit('submit', this.dataPayload)
    },
    setError (msg) {
      this.error = msg
      setTimeout(() => {
        this.dismissError()
      }, 5000)
    },
    dismissError () {
      this.error = ''
    }
  },
  watch: {
    step (value) {
      this.$emit('step-change', this.dataPayload)
    }
  }
}
</script>
