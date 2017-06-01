<template>
<div>
  <div>
    <div v-for="profile in addedProfiles" class="chip">
      {{profile}}&nbsp;
      <i class="fa fa-trash"></i>
    </div>
  </div>
  <div v-if="profileList.length">
    <m-select :options="availableProfiles" @input="onProfileSelected">
      <option v-if="availableProfiles.length" value="" disabled selected>Select a Profile to add</option>
      <option v-if="profileList.length && availableProfiles.length === 0" value="" disabled selected>The user has all the profiles (are you sure?)</option>
      <option v-for="profile in availableProfiles" :value="profile.id">{{profile.id}}</option>
    </m-select>
  </div>
  <div v-else>
    No profiles found (you should <router-link :to="{name: 'SecurityProfilesCreate'}" class="text-light-blue">create one</router-link> before creating a user)
  </div>
</div>
</template>

<script type="text/javascript">
import MSelect from '../../../Common/MSelect'
import { performSearchProfiles } from '../../../../services/kuzzleWrapper'

export default {
  name: 'UserProfileList',
  components: {
    MSelect
  },
  props: {
    addedProfiles: {
      type: Array
    }
  },
  data () {
    return {
      profileList: []
    }
  },
  computed: {
    availableProfiles () {
      return this.profileList.filter(profile => {
        return this.addedProfiles.indexOf(profile.id) === -1
      })
    }
  },
  methods: {
    fetchProfileList () {
      return performSearchProfiles()
      .then(result => {
        result.documents.forEach(profile => {
          this.profileList.push(profile)
        })
      })
    },
    onProfileSelected (profile) {
      this.$emit('selected-profile', profile)
    }
  },
  mounted () {
    return this.fetchProfileList()
  }
}
</script>

<style type="text/css" scoped>
.chip {
  margin-right: 5px;
}
</style>
