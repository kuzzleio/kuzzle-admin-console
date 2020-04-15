<template>
  <b-container fluid data-cy="UserItem">
    <b-row align-h="between" no-gutters>
      <b-col cols="12" class="UserItem-titleCol py-1 vertical-align">
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
        <a
          class="d-inline-block align-middle code pointer mr-2"
          @click="toggleCollapse"
          >{{ document.id }}</a
        >
        <div class="UserItem-profileList">
          <b-badge
            v-for="profile in profileList"
            :key="profile"
            class="ml-1"
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
          <div class="UserItem-whiteGradient"></div>
        </div>
        <label
          @click="toggleCollapse"
          v-if="
            document.additionalAttribute && document.additionalAttribute.value
          "
          class="UserItem-additionalAttribute"
          >({{ document.additionalAttribute.name }}:
          {{ document.additionalAttribute.value }})</label
        >
        <div class="UserItem-actions">
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
      <b-col> </b-col>
    </b-row>
    <b-row>
      <b-collapse
        :id="`collapse-${document.id}`"
        v-model="expanded"
        class="mt-3 ml-3 DocumentListItem-content"
      >
        <pre v-json-formatter="{ content: document.content, open: true }" />
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

      return this.document.content.profileIds
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
.UserItem-titleCol {
  display: flex;
}

.UserItem-actions {
  white-space: nowrap;
  flex-grow: 1;
}

.UserItem-additionalAttribute {
  color: grey;
  font-style: italic;
  color: black;
  line-height: 21px;
}

.UserItem-profileList {
  display: inline-block;
  overflow-x: hidden;
  white-space: nowrap;
  position: relative;
}

.UserItem-whiteGradient {
  position: absolute;
  right: 0;
  top: 0;
  width: 50px;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.65) 50%,
    rgba(255, 255, 255, 1) 100%
  );
}

.UserItem-actions {
  margin-top: 1px;
  font-size: 1em;
}
</style>
