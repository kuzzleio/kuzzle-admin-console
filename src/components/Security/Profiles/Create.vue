<template>
  <b-container class="CreateProfile d-flex flex-column h-100">
    <Headline>
      Create a new profile
    </Headline>
    <Notice />
    <create-or-update @cancel="onCancel" @submit="onSubmit" />
  </b-container>
</template>

<script>
import CreateOrUpdate from './CreateOrUpdate' ;
import Headline from '../../Materialize/Headline' ;
import Notice from '../Common/Notice' ;
import { mapGetters } from 'vuex' ;
export default {
  name: 'CreateProfile',
  components: {
    Headline,
    CreateOrUpdate,
    Notice
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle'])
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
        ) ;

        return ;
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
        }) ;
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
      this.error = payload ;
    }
  }
} ;
</script>
