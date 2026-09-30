<template>
  <Card data-cy="ProfileFilters">
    <CardContent class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-foreground">Search by role</span>

      <!--
        `b-dropdown-text` enveloppait une case à cocher et son libellé dans un
        élément qui n'était ni un bouton ni un élément de menu. C'est un
        `menuitemcheckbox` : il annonce son état, et le menu ne se ferme pas
        quand on coche.
      -->
      <div class="inline-block" data-cy="ProfileFilters-roleSelect">
        <DropdownMenu>
          <DropdownMenuTrigger :as="Button" variant="outline">
            Select roles to be contained in the profiles
            <i aria-hidden="true" class="fas fa-caret-down" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="max-h-96 overflow-y-auto">
            <DropdownMenuCheckboxItem
              v-for="role of roleList"
              :key="`dropdown-${role}`"
              :model-value="roleIsSelected(role)"
              :data-cy="`RoleSelect--${role}`"
              :title="role"
              @update:model-value="(checked) => toggleRole(role, checked === true)"
            >
              <!-- Sur l'élément de menu, `code` perdait contre le `font-sans`
                 de la primitive : il est porté par le texte lui-même (E-12). -->
              <span class="code">{{ role }}</span>
            </DropdownMenuCheckboxItem>
            <p v-if="roleList.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
              No roles found.
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Badge v-if="hasFilter" data-cy="ProfileFilters-filterAppliedPill" variant="info">
        Filters are being applied
      </Badge>

      <Button class="ml-auto" data-cy="ProfileFilters-resetBtn" variant="outline" @click="reset">
        Reset
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

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

const props = withDefaults(
  defineProps<{
    currentFilter?: string[];
  }>(),
  { currentFilter: () => [] },
);

const emit = defineEmits<{
  (e: 'filters-updated', roles: string[]): void;
  (e: 'reset'): void;
}>();

const kuzzleStore = useKuzzleStore();

const roleList = ref<string[]>([]);
const selectedRoles = ref<string[]>([]);

const hasFilter = computed(() => selectedRoles.value.length > 0);

/*
 * `toggleRole` mute le tableau sur place (`push` / `splice`). En Vue 2,
 * un watcher non `deep` se déclenchait sur ces mutations ; en Vue 3 il ne
 * voit que le changement de référence (G-058).
 */
watch(
  selectedRoles,
  () => {
    emit('filters-updated', selectedRoles.value);
  },
  { deep: true },
);

async function fetchRoleList(): Promise<void> {
  const wrapper = kuzzleStore.wrapper;
  if (!wrapper) {
    return;
  }
  const res = await wrapper.performSearchRoles();
  roleList.value = res.documents.map((role: { _id: string }) => role._id);
}

function roleIsSelected(role: string): boolean {
  return selectedRoles.value.includes(role);
}

function toggleRole(role: string, value: boolean): void {
  if (!value) {
    selectedRoles.value.splice(selectedRoles.value.indexOf(role), 1);
  } else {
    selectedRoles.value.push(role);
  }
}

function reset(): void {
  selectedRoles.value = [];
  emit('reset');
}

onMounted(() => {
  fetchRoleList();
  selectedRoles.value = props.currentFilter.map((role) => role);
});
</script>
