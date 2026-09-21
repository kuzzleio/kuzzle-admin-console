<template>
  <div class="SecurityLayout tw:flex tw:h-full tw:flex-row tw:flex-nowrap">
    <div
      class="SecurityLayout-sidebarWrapper tw:z-1 tw:h-full tw:min-w-[var(--sidebar-width)] tw:overflow-auto tw:bg-muted tw:pt-4"
      data-cy="SecurityLayout-sidebarWrapper"
    >
      <!--
        `<b-nav vertical>` ne rendait qu'un `<ul>` en colonne. Le rôle de
        navigation, lui, n'était porté par rien : c'est le `<nav>` qui le dit.
      -->
      <nav aria-label="Security sections">
        <ul class="tw:flex tw:list-none tw:flex-col tw:pl-0">
          <li v-for="section of visibleSections" :key="section.route">
            <router-link
              class="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-foreground tw:hover:bg-accent tw:hover:text-accent-foreground"
              :class="
                isCurrent(section)
                  ? 'tw:font-semibold tw:opacity-100'
                  : 'tw:font-light tw:opacity-60'
              "
              :aria-current="isCurrent(section) ? 'page' : undefined"
              :data-cy="`SecurityLayout-${section.segment}`"
              :to="{ name: section.route }"
            >
              <i class="fa fa-lg tw:w-6 tw:text-center" :class="section.icon" aria-hidden="true" />
              {{ section.label }}
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
    <div class="SecurityLayout-contentWrapper tw:h-full tw:grow tw:overflow-auto tw:p-6">
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { useAuthStore } from '@/stores';

export default {
  name: 'SecurityLayout',
  computed: {
    ...mapState(useAuthStore, ['canManageUsers', 'canManageRoles', 'canManageProfiles']),
    visibleSections() {
      return [
        {
          icon: 'fa-user',
          label: 'Users',
          route: 'SecurityUsersList',
          segment: 'users',
          visible: this.canManageUsers,
        },
        {
          icon: 'fa-id-badge',
          label: 'Profiles',
          route: 'SecurityProfilesList',
          segment: 'profiles',
          visible: this.canManageProfiles,
        },
        {
          icon: 'fa-unlock-alt',
          label: 'Roles',
          route: 'SecurityRolesList',
          segment: 'roles',
          visible: this.canManageRoles,
        },
      ].filter((section) => section.visible);
    },
  },
  methods: {
    /*
     * Le test porte sur le segment d'URL et non sur le nom de route : une
     * section reste la section courante quand on est sur la création ou
     * l'édition d'un de ses éléments. C'est ce que faisait déjà le `:class`
     * du `<b-nav-item>`.
     */
    isCurrent(section) {
      return this.$route.path.includes(section.segment);
    },
  },
};
</script>
