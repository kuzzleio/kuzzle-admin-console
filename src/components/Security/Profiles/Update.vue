<template>
  <b-container>
    <Headline>
      Edit profile - <span class="bold">{{ $route.params.id }}</span>
    </Headline>
    <Notice />
    <create-or-update
      v-if="!loading"
      :id="id"
      :profile="document"
      @cancel="onCancel"
      @submit="onSubmit"
    />
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
  data() {
    return {
      document: '{}',
      id: null,
      submitted: false,
      loading: true
    }
  },
  methods: {
    async onSubmit({ profile }) {
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

      this.submitted = true

      try {
        await this.$kuzzle.security.updateProfile(this.id, profile)
        this.$router.push({ name: 'SecurityProfilesList' })
      } catch (e) {
        this.$log.error(e)
        this.bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while updating the profile',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
        this.submitted = false
      }
    },
    onCancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.go(this.$router._prevTransition.to)
      } else {
        this.$router.push({ name: 'SecurityProfilesList' })
      }
    }
  },
  async mounted() {
    this.loading = true
    try {
      const profile = await this.$kuzzle.security.getProfile(
        this.$route.params.id
      )
      this.id = profile._id
      this.document = JSON.stringify({ policies: profile.policies }, null, 2)
      this.loading = false
    } catch (e) {
      this.$log.error(e)
      this.bvToast.toast('The complete error has been printed to console', {
        title: 'Ooops! Something went wrong while loading the profile',
        variant: 'warning',
        toaster: 'b-toaster-bottom-right',
        appendToast: true,
        dismissible: true,
        noAutoHide: true
      })
    }
  }
}
</script>
