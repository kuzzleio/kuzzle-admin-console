<template>
  <b-container>
    <Headline>
      Create a new profile
    </Headline>
    <Notice />
    <create-or-update @cancel="onCancel" @submit="onSubmit" />
  </b-container>
</template>

<script>
import CreateOrUpdate from './CreateOrUpdate'
import Headline from '../../Materialize/Headline'
import Notice from '../Common/Notice'

export default {
  name: 'SecurityUpdate',
  components: {
    Headline,
    CreateOrUpdate,
    Notice
  },
  async mounted() {
    try {
      const profile = await this.$kuzzle.security.getProfile(
        this.$route.params.id
      )
      this.id = profile._id
      this.document = { policies: profile.policies }
    } catch (e) {
      this.$store.direct.commit.toaster.setToast({ text: e.message })
    }
  },
  methods: {
    async onSubmit({ profile, id }) {
      if (!profile || !profile.policies) {
        this.$bvToast.toast(
          'Please, ensure you submit an object with at least a <code>policies</code> attribute inside',
          {
            title: 'The profile is invalid',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
        return
      }
      try {
        await this.$kuzzle.security.createProfile(id, profile)
        this.$router.push({ name: 'SecurityProfilesList' })
      } catch (e) {
        this.$log.error(e)
        this.$bvToast.toast(e.message, {
          title: 'Ooops! Something went wrong while creating the profile',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
    },
    onCancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.go(this.$router._prevTransition.to)
      } else {
        this.$router.push({ name: 'SecurityProfilesList' })
      }
    },
    setError(payload) {
      this.error = payload
    }
  }
}
</script>
