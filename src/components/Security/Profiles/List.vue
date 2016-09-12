<template>
  <div>
    <headline title="Profiles Management"></headline>
    <common-list
      item-name="ProfileItem"
      collection="profiles"
      index="%kuzzle"
      @create-clicked="createProfile">

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
            <button v-link="{name: 'SecurityProfilesCreate'}"
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

  export default {
    name: 'ProfilesList',
    components: {
      CommonList,
      Headline
    },
    methods: {
      createProfile () {
        this.$router.go({name: 'SecurityProfilesCreate'})
      }
    },
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
