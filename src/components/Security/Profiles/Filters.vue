<template>
  <Card data-cy="ProfileFilters">
    <CardContent class="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
      <span class="tw:text-sm tw:text-foreground">Search by role</span>

      <!--
        `b-dropdown-text` enveloppait une case à cocher et son libellé dans un
        élément qui n'était ni un bouton ni un élément de menu. C'est un
        `menuitemcheckbox` : il annonce son état, et le menu ne se ferme pas
        quand on coche.
      -->
      <DropdownMenu data-cy="ProfileFilters-roleSelect">
        <DropdownMenuTrigger :as="Button" variant="outline">
          Select roles to be contained in the profiles
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="tw:max-h-96 tw:overflow-y-auto">
          <DropdownMenuCheckboxItem
            v-for="role of roleList"
            :key="`dropdown-${role}`"
            :checked="roleIsSelected(role)"
            class="code"
            :data-cy="`RoleSelect--${role}`"
            :title="role"
            @update:checked="(checked) => toggleRole(role, checked)"
          >
            {{ role }}
          </DropdownMenuCheckboxItem>
          <p
            v-if="roleList.length === 0"
            class="tw:px-3 tw:py-2 tw:text-sm tw:text-muted-foreground"
          >
            No roles found.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge v-if="hasFilter" data-cy="ProfileFilters-filterAppliedPill" variant="secondary">
        Filters are being applied
      </Badge>

      <Button class="tw:ml-auto" data-cy="ProfileFilters-resetBtn" variant="outline" @click="reset">
        Reset
      </Button>
    </CardContent>
  </Card>
</template>

<script>
import { markRaw } from 'vue';
import { mapState } from 'pinia';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useKuzzleStore } from '@/stores';

export default {
  name: 'Filters',
  components: {
    Badge,
    Button,
    Card,
    CardContent,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
  },
  props: {
    labelSearchButton: {
      type: String,
      required: false,
      default: 'search',
    },
    currentFilter: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      /* `DropdownMenuTrigger` prend le composant en prop `as`, pas son nom. */
      Button: markRaw(Button),
      roleList: [],
      selectedRoles: [],
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
    hasFilter() {
      return this.selectedRoles.length > 0;
    },
  },
  watch: {
    selectedRoles() {
      this.$emit('filters-updated', this.selectedRoles);
    },
  },
  mounted() {
    this.fetchRoleList();
    this.selectedRoles = this.currentFilter.map((role) => role);
  },
  methods: {
    async fetchRoleList() {
      const res = await this.wrapper.performSearchRoles();
      this.roleList = res.documents.map((role) => role._id);
    },
    roleIsSelected(role) {
      return this.selectedRoles.includes(role);
    },
    toggleRole(role, value) {
      if (!value) {
        this.selectedRoles.splice(this.selectedRoles.indexOf(role), 1);
      } else {
        this.selectedRoles.push(role);
      }
    },
    reset() {
      this.selectedRoles = [];
      this.$emit('reset');
    },
  },
};
</script>
