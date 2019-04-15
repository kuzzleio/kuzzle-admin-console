<template>
  <div>
    <Headline>
       Edit profile - <span class="bold">{{decodeURIComponent($route.params.id)}}</span>
    </Headline>
    <Notice></Notice>
    <create-or-update
      title="Update profile"
      :update-id="id"
      :error="error"
      @document-create::create="update"
      @document-create::cancel="cancel"
      @document-create::error="setError"
      v-model="document"
      :hide-id="true"
      :submitted="submitted"
    >
    </create-or-update>
  </div>
</template>

<script>
import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
import Headline from '../../Materialize/Headline'
import Notice from '../Common/Notice'
import { SET_TOAST } from '../../../vuex/modules/common/toaster/mutation-types'

export default {
  name: 'SecurityUpdate',
  components: {
    Headline,
    CreateOrUpdate,
    Notice
  },
  data() {
    return {
      document: {},
      error: '',
      id: null,
      submitted: false
    }
  },
  methods: {
    async update() {
      this.error = ''

      if (!this.document || !this.document.policies) {
        this.error = 'The document is invalid, please review it'
        return
      }

      this.submitted = true

      try {
        await this.$kuzzle.security
          .updateProfile(this.id, {policies: this.document.policies})
        setTimeout(() => {
          // we can't perform refresh index on %kuzzle
          this.$router.push({ name: 'SecurityProfilesList' })
        }, 1000)
      } catch (e) {
        this.$store.commit(SET_TOAST, { text: e.message })
        this.submitted = false
      }
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.go(this.$router._prevTransition.to)
      } else {
        this.$router.push({ name: 'SecurityProfilesList' })
      }
    },
    setError(payload) {
      this.error = payload
    }
  },
  async mounted() {
    try {
      const profile = await this.$kuzzle.security
        .getProfile(this.$route.params.id)
      this.id = profile._id
      this.document = {policies: profile.policies}
    } catch (e) {
      this.$store.commit(SET_TOAST, { text: e.message })
    }
  }
}
</script>
