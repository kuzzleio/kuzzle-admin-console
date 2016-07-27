<template>
  <div :class="{ 'collapsed': collapsed }">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      id="checkbox-{{user.id}}"
      value="{{user.id}}"
      @click="notifyCheckboxClick"/>

    <label for="checkbox-{{user.id}}">{{user.id}}</label>

    <div class="right actions">
      <a class="action fa fa-pencil"></a>
      <dropdown :id="user.id">
        <li><a @click="deleteUser(user.id)">Delete</a></li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre>{{itemContent}}</pre><div class="profile-list">
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
const MAX_PROFILES = 5

export default {
  props: ['user'],
  components: {
    Dropdown
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

      return JSON.stringify(contentDisplay, ' ', 2)
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
  ready: function () {},
  attached: function () {},
  methods: {
    toggleCollapse () {
      this.collapsed = !this.collapsed
    },
    notifyCheckboxClick () {
      this.$emit('checkbox-click', this.user.id)
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
