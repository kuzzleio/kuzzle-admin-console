<template>
  <div>
    <headline title="Users Management">
      <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
    </headline>

    <div class="container">
      <div class="row">
        <div class="col12">
          <div class="collection">
            <div v-for="user in users" class="collection-item">
              {{user.username}}

              <a
                v-for="profile in user.profiles"
                v-link="{name: 'SecurityProfileDetail', params: {profileId: profile}}"
                class="chip">{{profile}}</a>

              <div class="right actions">
                <a class="action fa fa-pencil"></a>
                <a href="#" class="action dropdown-button fa fa-ellipsis-v" data-activates="{{user.id}}"></a>

                <ul id="{{user.id}}" class='dropdown-content'>
                  <li><a>Delete</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .collection {
    overflow: inherit;

    .actions {
      margin-top: 6px;
      font-size: 1.3em;

      .action {
        margin-right: 10px;
      }
    }
  }
</style>

<script>
  import Headline from '../../Layout/Headline'

  export default {
    components: {
      Headline
    },
    data () {
      return {
        users: [
          {
            id: 'toto',
            username: 'toto',
            profiles: ['profile1', 'profile2']
          },
          {
            id: 'tutu',
            username: 'tutu',
            profiles: ['profile1', 'profile3']
          }
        ]
      }
    },
    ready () {
      /*eslint no-undef: 0*/
      jQuery(this.$el).find('.dropdown-button').dropdown()
    }
  }
</script>