<template>
  <!--
    Barre de session (ADR-0055) : qui est connecté, visible en permanence,
    rail ouvert ou replié. Le nom ouvre un menu avec les profils — ce sont
    eux qui disent avec quels droits on agit — puis la déconnexion. La
    bascule de thème la précède (ADR-0056).
  -->
  <header
    class="SessionBar flex h-12 shrink-0 items-center justify-end gap-2 px-4 md:px-6"
    data-cy="SessionBar"
  >
    <!--
      Thème (ADR-0056) : système, clair ou sombre. L'icône dit le thème
      choisi ; le libellé accessible le nomme.
    -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          :aria-label="`Theme: ${currentTheme.label}`"
          data-cy="SessionBar-theme"
          size="icon-sm"
          :title="`Theme: ${currentTheme.label}`"
          variant="ghost"
        >
          <i aria-hidden="true" :class="['fas', currentTheme.icon, 'text-muted-foreground']" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          :model-value="preference"
          @update:model-value="(value) => setPreference(value as ThemePreference)"
        >
          <DropdownMenuRadioItem
            v-for="theme of themes"
            :key="theme.value"
            :data-cy="`SessionBar-theme--${theme.value}`"
            :value="theme.value"
          >
            <i aria-hidden="true" :class="['fas', theme.icon, 'w-4 text-center']" />
            {{ theme.label }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type ThemePreference, useTheme } from '@/composables/useTheme';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
const router = useRouter();
const { preference, setPreference } = useTheme();

const themes: { icon: string; label: string; value: ThemePreference }[] = [
  { icon: 'fa-desktop', label: 'System', value: 'system' },
  { icon: 'fa-sun', label: 'Light', value: 'light' },
  { icon: 'fa-moon', label: 'Dark', value: 'dark' },
];
const currentTheme = computed(
  () => themes.find((theme) => theme.value === preference.value) ?? themes[0],
);

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
