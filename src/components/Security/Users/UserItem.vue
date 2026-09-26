<template>
  <div class="UserItem px-3" data-cy="UserItem">
    <div class="flex flex-row items-center gap-2 py-1">
      <i
        aria-hidden="true"
        class="fa cursor-pointer px-1"
        :class="`fa-caret-${expanded ? 'down' : 'right'}`"
        :data-cy="`UserItem-${document.id}--toggle`"
        @click="toggleCollapse"
      />
      <Checkbox
        :id="checkboxId"
        v-model="checked"
        class="me-2"
        :data-cy="`UserListItem-checkbox--${document.id}`"
        @change="notifyCheckboxClick"
      />

      <div class="grow">
        <div class="flex flex-wrap items-center gap-2">
          <a class="code cursor-pointer" @click="toggleCollapse">{{ document.id }}</a>
          <span
            v-if="localStrategyUsername"
            class="code"
            :data-cy="`local-strategy-username-${localStrategyUsername}`"
          >
            <i class="fas fa-user text-muted-foreground" title="Username (local strategy)" />
            {{ localStrategyUsername }}
          </span>
          <span
            v-if="document.additionalAttribute && document.additionalAttribute.value"
            class="cursor-pointer text-sm italic text-muted-foreground"
            @click="toggleCollapse"
            >({{ document.additionalAttribute.name }}:
            {{ document.additionalAttribute.value }})</span
          >
        </div>
        <div class="flex flex-row flex-wrap gap-1 py-1">
          <Badge v-for="profile in profileList" :key="profile">
            <router-link class="truncate text-primary-foreground" :to="profileRoute(profile)">{{
              profile
            }}</router-link>
          </Badge>
        </div>
      </div>

      <div class="flex flex-nowrap items-center">
        <Button
          class="UserListItem-update"
          :data-cy="`UserListItem-update--${document.id}`"
          :disabled="!canEditUser"
          size="icon"
          :title="canEditUser ? 'Edit User' : 'You are not allowed to edit this user'"
          variant="ghost"
          @click.prevent="update"
        >
          <i class="fa fa-pencil-alt" aria-hidden="true" />
        </Button>
        <Button
          class="UserListItem-delete"
          :data-cy="`UserListItem-delete--${document.id}`"
          :disabled="!canDeleteUser"
          size="icon"
          :title="canDeleteUser ? 'Delete user' : 'You are not allowed to delete this user'"
          variant="ghost"
          @click.prevent="deleteDocument(document.id)"
        >
          <i class="fa fa-trash" aria-hidden="true" />
        </Button>
      </div>
    </div>

    <div v-show="expanded" :id="`collapse-${document.id}`" class="DocumentListItem-content ms-3">
      <pre v-json-formatter="{ content: document, open: true }" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import jsonFormatter from '@/directives/json-formatter.directive';
import { useAuthStore } from '@/stores';

const MAX_PROFILES = 5;

export default {
  name: 'UserItem',
  components: {
    Badge,
    Button,
    Checkbox,
  },
  directives: {
    jsonFormatter,
  },
  props: {
    document: Object,
    isChecked: Boolean,
  },
  data() {
    return {
      expanded: false,
      checked: false,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canEditUser', 'canDeleteUser']),
    profileList() {
      if (!this.document.profileIds) {
        return [];
      }
      const sorted = [...this.document.profileIds].sort();
      return sorted;
    },
    showAllProfiles() {
      return this.document.profileIds > MAX_PROFILES;
    },
    checkboxId() {
      return `checkbox-${this.document.id}`;
    },
    localStrategyUsername() {
      return this.document.credentials && this.document.credentials.local
        ? this.document.credentials.local.username
        : null;
    },
  },
  watch: {
    isChecked: {
      handler(value) {
        this.checked = value;
      },
    },
  },
  methods: {
    profileRoute(profile) {
      return { name: 'SecurityProfilesUpdate', params: { id: profile } };
    },
    toggleCollapse() {
      this.expanded = !this.expanded;
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document.id);
    },
    deleteDocument() {
      if (this.canDeleteUser) {
        this.$emit('delete', this.document.id);
      }
    },
    update() {
      if (this.canEditUser) {
        this.$emit('edit', this.document.id);
      }
    },
  },
};
</script>
