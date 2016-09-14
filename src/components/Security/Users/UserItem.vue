<template>
  <div :class="{ 'collapsed': collapsed }" class="item-document">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      id="checkbox-{{document.id}}"
      value="{{document.id}}"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label for="checkbox-{{document.id}}"></label>
    <!-- The following anchor will go to the user details page -->
    <label class="item-title">
      <a @click="toggleCollapse">{{document.id}}</a>
      <div class="profile-list">
        <div class="profile-chip chip" v-for="profile in profileList">
          <a v-link="{name: 'SecurityProfilesUpdate', params: { id: profile }}" class="truncate" >{{profile}}</a>
        </div>
        <div class="chip show-all-profiles" v-if="showAllProfiles">
          <a v-link="{ name: 'SecurityProfilesList', params: { userId: document.id }}">Show all...</a>
        </div>
      </div>
    </label>

    <label v-if="document.additionalAttribute && document.additionalAttribute.value" class="additional-attribute">
      ({{document.additionalAttribute.name}}: {{document.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <a v-if="canEditUser()"
         v-link="{name: 'SecurityUsersUpdate', params: {id: document.id}}">
         <i class="fa fa-pencil"></i>
      </a>
      <a v-if="!canEditUser()"
         v-title="{active: !canEdit, title: 'You are not allowed to edit this user'}">
         <i class="fa fa-pencil disabled"></i>
      </a>
      <dropdown :id="document.id" class="icon-black">
        <li><a v-bind:class="{'disabled': !canDeleteUser()}"
               v-title="{active: !canDeleteUser(), title: 'You are not allowed to delete this user'}"
               @click="deleteDocument(document.id)">Delete</a>
        </li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="itemContent"></pre>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .profile-list {
    display: inline-flex;
  }
  .profile-chip {
    opacity: 0.7;
    &:hover,
    &:focus {
      opacity: 1;
    }
  }
</style>

<script>
import Dropdown from '../../Materialize/Dropdown'
import jsonFormatter from '../../../directives/json-formatter.directive'
import { canEditUser, canDeleteUser } from '../../../services/userAuthorization'
import title from '../../../directives/title.directive'

const MAX_PROFILES = 5

export default {
  name: 'UserItem',
  props: {
    document: Object,
    isChecked: Boolean
  },
  components: {
    Dropdown
  },
  directives: {
    jsonFormatter,
    title
  },
  data () {
    return {
      collapsed: true
    }
  },
  computed: {
    itemContent () {
      let contentDisplay = {...this.document.content}
      delete contentDisplay.clearPassword
      delete contentDisplay.profileIds

      return contentDisplay
    },
    profileList () {
      return this.document.content.profileIds.filter((item, idx) => {
        return idx < MAX_PROFILES
      })
    },
    showAllProfiles () {
      return this.document.content.profileIds > MAX_PROFILES
    }
  },
  methods: {
    toggleCollapse () {
      this.collapsed = !this.collapsed
    },
    notifyCheckboxClick () {
      this.$dispatch('checkbox-click', this.document.id)
    },
    deleteDocument () {
      if (this.canDeleteUser()) {
        this.$dispatch('delete-document', this.document.id)
      }
    },
    canEditUser,
    canDeleteUser
  }
}
</script>
