<template>
  <div>
    <b-container fluid data-cy="UserItem" class="UserItem">
      <div class="UserItem-toggle-select mr-3">
        <i
          aria-role="button"
          :class="`fa fa-caret-${expanded ? 'down' : 'right'} mr-2 `"
          :data-cy="`UserItem-${document.id}--toggle`"
          @click="toggleCollapse"
        />
        <b-form-checkbox
          type="checkbox"
          value="true"
          unchecked-value="false"
          v-model="checked"
          :data-cy="`UserListItem-checkbox--${document.id}`"
          :id="checkboxId"
          @change="notifyCheckboxClick"
        />
      </div>
      <div class="UserItem-title">
        <div class="UserItem-title-info">
          <a
            class="d-inline-block align-middle code pointer mr-2"
            @click="toggleCollapse"
            >{{ document.id }}</a
          >
          <span
            v-if="localStrategyUsername"
            :data-cy="`local-strategy-username-${localStrategyUsername}`"
            class="d-inline-block align-middle code ml-2 mr-2"
          >
            <i
              class="fas fa-user text-secondary"
              title="Username (local strategy)"
            />
            {{ localStrategyUsername }}
          </span>
          <label
            @click="toggleCollapse"
            v-if="
              document.additionalAttribute && document.additionalAttribute.value
            "
            class="UserItem-title-additionalAttribute"
            >({{ document.additionalAttribute.name }}:
            {{ document.additionalAttribute.value }})</label
          >
        </div>
        <div class="UserItem-title-profiles">
          <b-badge
            v-for="profile in profileList"
            :key="profile"
            class="mr-1 mt-1 mb-1"
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
        </div>
      </div>
      <div class="UserItem-actions">
        <b-button
          class="UserListItem-update"
          href=""
          variant="link"
          :data-cy="`UserListItem-update--${document.id}`"
          :disabled="!canEditUser"
          :title="
            canEditUser ? 'Edit User' : 'You are not allowed to edit this user'
          "
          @click.prevent="update"
        >
          <i class="fa fa-pencil-alt" :class="{ disabled: !canEditUser }" />
        </b-button>
        <b-button
          class="UserListItem-delete"
          href=""
          variant="link"
          :data-cy="`UserListItem-delete--${document.id}`"
          :disabled="!canDeleteUser"
          :title="
            canDeleteUser
              ? 'Delete user'
              : 'You are not allowed to delete this user'
          "
          @click.prevent="deleteDocument(document.id)"
        >
          <i class="fa fa-trash" :class="{ disabled: !canDeleteUser }" />
        </b-button>
      </div>
    </b-container>
    <b-collapse
      :id="`collapse-${document.id}`"
      v-model="expanded"
      class="ml-3 DocumentListItem-content"
    >
      <pre v-json-formatter="{ content: document, open: true }" />
    </b-collapse>
  </div>
</template>

<script>
import jsonFormatter from '../../../directives/json-formatter.directive'
import { mapGetters } from 'vuex'

const MAX_PROFILES = 5

export default {
  name: 'UserItem',
  components: {},
  directives: {
    jsonFormatter
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
    ...mapGetters('auth', ['canEditUser', 'canDeleteUser']),
    profileList() {
      if (!this.document.profileIds) {
        return []
      }
      const sorted = [...this.document.profileIds].sort()
      return sorted
    },
    showAllProfiles() {
      return this.document.profileIds > MAX_PROFILES
    },
    checkboxId() {
      return `checkbox-${this.document.id}`
    },
    localStrategyUsername() {
      return this.document.credentials && this.document.credentials.local
        ? this.document.credentials.local.username
        : null
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
      if (this.canDeleteUser) {
        this.$emit('delete', this.document.id)
      }
    },
    update() {
      if (this.canEditUser) {
        this.$emit('edit', this.document.id)
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.UserItem {
  display: flex;
  flex-direction: row;
  align-items: center;

  &-toggle-select {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }

  &-actions {
    display: flex;
    flex-wrap: nowrap;
  }

  &-title {
    flex-grow: 1;

    &-profiles {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }

    &-additionalAttribute {
      color: grey;
      font-style: italic;
      color: black;
      line-height: 21px;
    }
  }
}
</style>
