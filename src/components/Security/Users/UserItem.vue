<template>
  <div :class="{ 'collapsed': collapsed }" class="item-document">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      id="checkbox-{{document.id}}"
      value="{{document.id}}"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label for="checkbox-{{document.id}}" ></label>
    <!-- The following anchor will go to the user details page -->
    <label class="item-title"><a>{{document.id}}</a></label>

    <label v-if="document.additionalAttribute && document.additionalAttribute.value" class="additional-attribute">
      ({{document.additionalAttribute.name}}: {{document.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <a v-link="{name: 'SecurityUsersUpdate', params: {id: document.id}}"><i class="fa fa-pencil"></i></a>
      <dropdown :id="document.id" class="icon-black">
        <li><a @click="deleteDocument(document.id)">Delete</a></li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="itemContent"></pre>
      <div class="profile-list">
        <div class="profile-chip chip" v-for="profile in profileList">
          <a v-link="{name: 'SecurityProfilesUpdate', params: { id: profile }}" class="truncate" >{{profile}}</a>
        </div>
        <div class="chip show-all-profiles" v-if="showAllProfiles">
          <a v-link="{ name: 'SecurityProfilesList', params: { userId: document.id }}">Show all...</a>
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
    document: Object,
    isChecked: Boolean
  },
  components: {
    Dropdown
  },
  directives: {
    jsonFormatter
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
      this.$dispatch('delete-document', this.document.id)
    }
  }
}
</script>
