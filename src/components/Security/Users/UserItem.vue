<template>
  <div :class="{ 'collapsed': collapsed }">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      id="checkbox-{{user.id}}"
      value="{{user.id}}"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label for="checkbox-{{user.id}}" ></label>
    <!-- The following anchor will go to the user details page -->
    <label class="item-title"><a>{{user.id}}</a></label>

    <label v-if="user.additionalAttribute && user.additionalAttribute.value" class="additional-attribute">
      ({{user.additionalAttribute.name}}: {{user.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <dropdown :id="user.id">
        <li><a @click="deleteUser(user.id)">Delete</a></li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="itemContent"></pre><div class="profile-list">
        <div class="profile-chip chip" v-for="profile in profileList">
          <a v-link="{name: 'SecurityProfileDetail', params:{ profileId: profile }}" class="truncate" >{{profile}}</a>
        </div>
        <div class="chip show-all-profiles" v-if="showAllProfiles">
          <a v-link="{ name: 'SecurityProfilesList', params: { userId: user.id }}">Show all...</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
import jsonFormatter from '../../../directives/json-formatter.directive'

const MAX_PROFILES = 5

export default {
  name: 'UserItem',
  props: {
    user: Object,
    isChecked: Boolean
  },
  components: {
    Dropdown
  },
  directives: {
    jsonFormatter
  },
  data: function () {
    return {
      collapsed: true
    }
  },
  computed: {
    itemContent () {
      let contentDisplay = {}
      Object.assign(contentDisplay, this.user.content)
      delete contentDisplay.clearPassword
      delete contentDisplay.profilesIds

      return contentDisplay // JSON.stringify(contentDisplay, ' ', 2)
    },
    profileList () {
      return this.user.content.profilesIds.filter((item, idx) => {
        return idx < MAX_PROFILES
      })
    },
    showAllProfiles () {
      return this.user.content.profileIds > MAX_PROFILES
    }
  },
  methods: {
    toggleCollapse () {
      this.collapsed = !this.collapsed
    },
    notifyCheckboxClick () {
      this.$dispatch('checkbox-click', this.user.id)
    },
    deleteUser () {
      this.$dispatch('delete-user', this.user.id)
    }
  }
}
</script>

<style lang="css" scoped>
  i.item-toggle {
    padding: 0 10px;
    margin-left: -10px;
    cursor: pointer;
    transition-duration: .2s;
  }

  .collapsed i.item-toggle {
      transform: rotate(-90deg);
  }

  /* HACK enabling to click on the title without checking the checkbox */
  label.item-title {
    cursor: pointer;
    font-size: 1rem;
    -webkit-user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -ms-user-select: none;
  }

  .item-title a {
    color: #272727;
  }

  /* HACK for centring the checkbox between the caret and the title */
  [type="checkbox"] + label {
    height: 15px;
    padding-left: 30px;
  }

  .item-content {
    transition-duration: .2s;
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 10px 10px 0 0;
  }

  .collapsed .item-content {
    max-height: 0;
    transition-duration: 0;
    padding: 0 10px 0 0;
  }

  .item-content pre {
    margin: 0;
    width: 70%;
    display: inline-block;
  }

  .item-content .profile-list {
    display: inline-block;
    width: 30%;
    vertical-align: top;
    text-align: right;
  }

  .profile-chip {
    margin: 0 0 5px 5px;
    max-width: 150px;
  }

  .show-all-profiles {
    background-color: transparent;
  }

</style>
