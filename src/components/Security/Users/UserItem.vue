<template>
  <b-container fluid data-cy="UserItem">
    <b-row align-h="between" no-gutters>
      <b-col cols="10" class="py-1">
        <!-- <div class="UserItem" :class="{ collapsed: collapsed }"> -->
        <!-- class="UserItem-toggle fa fa-caret-down item-toggle" -->
        <i
          aria-hidden="true"
          :class="
            `fa fa-caret-${
              expanded ? 'down' : 'right'
            } mr-2  d-inline-block align-middle`
          "
          :data-cy="`UserItem-${document.id}--toggle`"
          @click="toggleCollapse"
        />
        <b-form-checkbox
          class="d-inline-block align-middle"
          type="checkbox"
          value="true"
          unchecked-value="false"
          v-model="checked"
          :data-cy="`UserListItem-checkbox--${document.id}`"
          :id="checkboxId"
          @change="notifyCheckboxClick"
        />
        <!-- The following anchor will go to the user details page -->
        <!-- <label class="UserItem-title item-title"> -->
        <a
          class="d-inline-block align-middle code pointer"
          @click="toggleCollapse"
          >{{ document.id }}</a
        >
        <b-badge
          v-for="profile in profileList"
          :key="profile"
          class="mx-2"
          variant="primary"
        >
          <router-link
            :to="{
              name: 'SecurityProfilesUpdate',
              params: { id: profile }
            }"
            class="truncate text-white"
            >{{ profile }}</router-link
          >
        </b-badge>
        <b-badge v-if="showAllProfiles" class="mx-2" variant="primary">
          <router-link
            :to="{
              name: 'SecurityProfilesList',
              params: { userId: document.id }
            }"
            >Show all...</router-link
          >
        </b-badge>

        <label
          @click="toggleCollapse"
          v-if="
            document.additionalAttribute && document.additionalAttribute.value
          "
          class="UserItem-additionalAttribute"
          >({{ document.additionalAttribute.name }}:
          {{ document.additionalAttribute.value }})</label
        >
      </b-col>
      <b-col cols="2">
        <div class="float-right">
          <b-button
            class="UserListItem-update"
            href=""
            variant="link"
            :data-cy="`UserListItem-update--${document.id}`"
            :disabled="!canEditUser()"
            :title="
              canEditUser()
                ? 'Edit User'
                : 'You are not allowed to edit this user'
            "
            @click.prevent="update"
          >
            <i class="fa fa-pencil-alt" :class="{ disabled: !canEditUser() }" />
          </b-button>
          <b-button
            class="UserListItem-delete"
            href=""
            variant="link"
            :data-cy="`UserListItem-delete--${document.id}`"
            :disabled="!canDeleteUser()"
            :title="
              canDeleteUser()
                ? 'Delete user'
                : 'You are not allowed to delete this user'
            "
            @click.prevent="deleteDocument(document.id)"
          >
            <i class="fa fa-trash" :class="{ disabled: !canDeleteUser() }" />
          </b-button>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-collapse
        :id="`collapse-${document.id}`"
        v-model="expanded"
        class="mt-3 ml-3 DocumentListItem-content"
      >
        <pre v-json-formatter="{ content: document.content, open: true }" />
        <pre v-json-formatter="{ content: document.meta, open: false }" />
        <pre
          v-if="document.credentials"
          v-json-formatter="{ content: document.credentials, open: true }"
        />
      </b-collapse>
    </b-row>
  </b-container>
</template>

<script>
import jsonFormatter from '../../../directives/json-formatter.directive'
import { canEditUser, canDeleteUser } from '../../../services/userAuthorization'
import title from '../../../directives/title.directive'

const MAX_PROFILES = 5

export default {
  name: 'UserItem',
  components: {},
  directives: {
    jsonFormatter,
    title
  },
  props: {
    document: Object,
    isChecked: Boolean
  },
  data() {
    return {
      expanded: false,
      checked: false
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
  watch: {
    isChecked: {
      handler(value) {
        this.checked = value
      }
    }
  },
  methods: {
    toggleCollapse() {
      this.expanded = !this.expanded
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document.id)
    },
    deleteDocument() {
      if (this.canDeleteUser()) {
        this.$emit('delete', this.document.id)
      }
    },
    update() {
      if (this.canEditUser()) {
        this.$emit('edit', this.document.id)
      }
    },
    canEditUser,
    canDeleteUser
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.UserItem-toggle {
  padding: 0 10px;
  margin-left: -10px;
  cursor: pointer;
  transition-duration: 0.2s;
}

/* HACK for centring the checkbox between the caret and the title */
[type='checkbox'] + span:not(.lever) {
  height: 15px;
  padding-left: 30px;
}

/* HACK enabling to click on the title without checking the checkbox */
.UserItem-title {
  cursor: pointer;
  font-size: 1rem;
  color: #272727;
}

.UserItem-content {
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
pre {
  font-size: 16px;
}
.collapsed {
  .UserItem-toggle {
    transform: rotate(-90deg);
  }
  .UserItem-content {
    max-height: 0;
    transition-duration: 0;
    padding: 0 10px 0 0;
  }
}

.UserItem-additionalAttribute {
  color: grey;
  font-style: italic;
  color: black;
  line-height: 21px;
}

.UserItem-profileList {
  display: inline-flex;

  .profileChip {
    opacity: 0.7;
    &:hover,
    &:focus {
      opacity: 1;
    }
  }
}

.UserItem-actions {
  margin-top: 1px;
  font-size: 1em;
}
</style>
