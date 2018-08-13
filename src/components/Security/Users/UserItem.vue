<template>
  <div :class="{ 'collapsed': collapsed }" class="item-document">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      :id="checkboxId"
      :value="document.id"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label :for="checkboxId"></label>
    <!-- The following anchor will go to the user details page -->
    <label class="item-title">
      <a @click="toggleCollapse">{{document.id}}</a>
      <div class="profile-list">
        <div class="profile-chip chip" v-for="profile in profileList" :key="profile">
          <router-link :to="{name: 'SecurityProfilesUpdate', params: { id: profile }}" class="truncate" >{{profile}}</router-link>
        </div>
        <div class="chip show-all-profiles" v-if="showAllProfiles">
          <router-link :to="{ name: 'SecurityProfilesList', params: { userId: document.id }}">Show all...</router-link>
        </div>
      </div>
    </label>

    <label v-if="document.additionalAttribute && document.additionalAttribute.value" class="additional-attribute">
      ({{document.additionalAttribute.name}}: {{document.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <a href="#" @click.prevent="update"
         v-title="{active: !canEditUser(), title: 'You are not allowed to edit this user'}">
        <i class="fa fa-pencil" :class="{'disabled': !canEditUser()}"></i>
      </a>
      <dropdown :id="document.id" myclass="icon-black">
        <li><a @click="deleteDocument(document.id)"
               :class="{'disabled': !canDeleteUser()}"
               v-title="{active: !canDeleteUser(), title: 'You are not allowed to delete this user'}">
          Delete</a>
        </li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="{content: document.content, open: true}"></pre>
      <pre v-json-formatter="{content: document.meta, open: true}"></pre>
      <pre v-json-formatter="{content: document.credentials, open: true}"></pre>
    </div>
  </div>
</template>

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
  data() {
    return {
      collapsed: true
    }
  },
  computed: {
    profileList() {
      if (!this.document.content.profileIds) {
        return []
      }

      return this.document.content.profileIds.filter((item, idx) => {
        return idx < MAX_PROFILES
      })
    },
    showAllProfiles() {
      return this.document.content.profileIds > MAX_PROFILES
    },
    checkboxId() {
      return `checkbox-${this.document.id}`
    }
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document.id)
    },
    deleteDocument() {
      if (this.canDeleteUser()) {
        this.$emit('delete-document', this.document.id)
      }
    },
    update() {
      if (this.canEditUser()) {
        this.$emit(
          'common-list::edit-document',
          'SecurityUsersUpdate',
          this.document.id
        )
      }
    },
    canEditUser,
    canDeleteUser
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.item-toggle {
  padding: 0 10px;
  margin-left: -10px;
  cursor: pointer;
  transition-duration: 0.2s;
}

/* HACK enabling to click on the title without checking the checkbox */
.item-title {
  cursor: pointer;
  font-size: 1rem;
}

.item-title a {
  color: #272727;
}

/* HACK for centring the checkbox between the caret and the title */
[type='checkbox'] + label {
  height: 15px;
  padding-left: 30px;
}

.item-content {
  transition-duration: 0.2s;
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px 10px 0 0;

  pre {
    margin: 0;
    width: 70%;
    display: inline-block;
  }
}

.collapsed {
  .item-toggle {
    transform: rotate(-90deg);
  }
  .item-content {
    max-height: 0;
    transition-duration: 0;
    padding: 0 10px 0 0;
  }
}

label {
  color: black;
  line-height: 21px;
}
.additional-attribute {
  color: grey;
  font-style: italic;
}
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
.actions {
  margin-top: 1px;
  font-size: 1em;
}
</style>
