<template>
  <div>
    <headline title="Profiles Management"></headline>

    <!-- Not allowed -->
    <list-not-allowed v-if="!canSearchProfile()"></list-not-allowed>
    
    <common-list
      v-if="canSearchProfile()"
      item-name="ProfileItem"
      collection="profiles"
      index="%kuzzle"
      @create-clicked="createProfile"
      :display-create="canCreateProfile()"
      :perform-search="performSearchProfiles">

      <div slot="emptySet" class="card-panel">
        <div class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i class="fa fa-6x fa-users grey-text text-lighten-1" aria-hidden="true"></i>
          </div>
          <div class="col s10">
            <p>
              Here you'll see the kuzzle's profiles<br/>
              <em>Currently there is no profile.</em>
            </p>
            <router-link :disabled="!canCreateProfile()"
                    :class="!canCreateProfile() ? 'disabled' : ''"
                    :title="!canCreateProfile() ? 'You are not allowed to create new profiles' : ''"
                    :to="{name: 'SecurityProfilesCreate'}"
                    class="btn primary waves-effect waves-light">
              <i class="fa fa-plus-circle left"></i>
              Create a profile
            </router-link>
          </div>
        </div>
      </div>
    </common-list>
  </div>
</template>

<script>
  import CommonList from '../../Common/List'
  import ListNotAllowed from '../../Common/ListNotAllowed'
  import Headline from '../../Materialize/Headline'
  import { canSearchProfile, canCreateProfile } from '../../../services/userAuthorization'
  import { performSearchProfiles } from '../../../services/kuzzleWrapper'

  export default {
    name: 'ProfilesList',
    components: {
      CommonList,
      ListNotAllowed,
      Headline
    },
    methods: {
      createProfile () {
        this.$router.push({name: 'SecurityProfilesCreate'})
      },
      canSearchProfile,
      canCreateProfile,
      performSearchProfiles
    },
    route: {
      data () {
        this.$emit('crudl-refresh-search')
      }
    }
  }
</script>
