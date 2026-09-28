<template>
  <!--
    Barre de session (ADR-0055) : qui est connecté, visible en permanence,
    rail ouvert ou replié. Le nom ouvre un menu avec les profils — ce sont
    eux qui disent avec quels droits on agit — puis la déconnexion.
  -->
  <header
    class="SessionBar flex h-12 shrink-0 items-center justify-end gap-2 px-4 md:px-6"
    data-cy="SessionBar"
  >
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button class="max-w-full min-w-0" data-cy="SessionBar-user" size="sm" variant="ghost">
          <i aria-hidden="true" class="fas fa-user-circle text-base text-muted-foreground" />
          <span class="sr-only">Signed in as</span>
          <span class="truncate" data-cy="SessionBar-userName">{{ userName }}</span>
          <i aria-hidden="true" class="fas fa-caret-down text-xs text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-64">
        <DropdownMenuGroup v-if="profiles.length">
          <DropdownMenuLabel>Profiles</DropdownMenuLabel>
          <!--
            Les profils sont une information, pas des choix : ils ne sont pas
            des éléments du menu, que les flèches parcourraient.
          -->
          <div class="flex flex-wrap gap-1 px-2 pb-2" data-cy="SessionBar-profiles">
            <Badge v-for="profile of profiles" :key="profile" variant="secondary">{{
              profile
            }}</Badge>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator v-if="profiles.length" />
        <DropdownMenuItem data-cy="SessionBar-logoutBtn" @select="logout">
          <i aria-hidden="true" class="fas fa-power-off w-4 text-center" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
const router = useRouter();

const userName = computed((): string => {
  const user = authStore.user;
  if (!user) {
    return 'Not authenticated';
  }
  if (user.id === -1) {
    return 'Anonymous';
  }
  return typeof user.params?.name === 'string' && user.params.name ? user.params.name : user.id;
});

// `getCurrentUser` rend les profils dans `_source`, que la session garde en
// `params` ; une session anonyme n'a que le profil `anonymous`.
const profiles = computed((): string[] => {
  const user = authStore.user;
  if (!user) {
    return [];
  }
  if (user.id === -1) {
    return ['anonymous'];
  }
  const profileIds: unknown = user.params?.profileIds;
  return Array.isArray(profileIds) ? profileIds.filter((id) => typeof id === 'string') : [];
});

async function logout(): Promise<void> {
  try {
    await authStore.doLogout();
  } catch (error) {
    console.error('LOGOUT', error);
  } finally {
    await router.push({ name: 'Login' });
  }
}
</script>
