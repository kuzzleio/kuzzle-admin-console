<template>
  <div>
    <headline title="Profiles Management"></headline>

    <!-- Not allowed -->
    <div class="card-panel" v-if="!canSearchProfile()">
      <div class="row valign-bottom empty-set empty-set-condensed">
        <div class="col s1 offset-s1">
          <i class="fa fa-6x fa-lock grey-text text-lighten-1" aria-hidden="true"></i>
        </div>
        <div class="col s10">
          <p>
            You are not allowed to access the profiles list<br>
          </p>
          <p>
            <em>Learn more about security &amp; permissions on <a href="http://kuzzle.io/guide/#permissions" target="_blank">http://kuzzle.io/guide</a></em>
          </p>
        </div>
      </div>
    </div>

    <common-list
      v-if="canSearchProfile()"
      item-name="ProfileItem"
      collection="profiles"
      index="%kuzzle"
      @create-clicked="createProfile"
      :display-create="canCreateProfile()">

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
            <button :disabled="!canCreateProfile()"
                    :class="!canCreateProfile() ? 'disabled' : ''"
                    title="{{!canCreateProfile() ? 'You are not allowed to create new profiles' : ''}}"
                    v-link="{name: 'SecurityProfilesCreate'}"
                    class="btn primary waves-effect waves-light">
              <i class="fa fa-plus-circle left"></i>
              Create a profile
            </button>
          </div>
        </div>
      </div>
    </common-list>
  </div>
</template>

<script>
  import CommonList from '../../Common/List'
  import Headline from '../../Materialize/Headline'
  import { canSearchProfile, canCreateProfile } from '../../../services/userAuthorization'

  export default {
    name: 'ProfilesList',
    components: {
      CommonList,
      Headline
    },
    methods: {
      createProfile () {
        this.$router.go({name: 'SecurityProfilesCreate'})
      },
      canSearchProfile,
      canCreateProfile
    },
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
