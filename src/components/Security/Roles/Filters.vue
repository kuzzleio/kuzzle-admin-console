<template>
  <Card class="RolesFilters" data-cy="RolesFilters">
    <CardContent class="flex flex-wrap items-center gap-2">
      <div class="RolesFilters-searchBar flex min-w-48 flex-1 items-center gap-2">
        <i class="RolesFilters-searchIcon fa fa-search text-muted-foreground" aria-hidden="true" />
        <TagsInput v-model="controllers" class="min-w-0 flex-1">
          <TagsInputItem v-for="controller of controllers" :key="controller" :value="controller">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput
            aria-label="Search by controller"
            data-cy="RoleFilters-searchBar"
            placeholder="Search by controller..."
          />
        </TagsInput>
      </div>

      <DropdownMenu v-if="availableControllers.length !== 0">
        <DropdownMenuTrigger
          id="controllers-dropdown"
          :as="Button"
          :disabled="disableDropdown"
          :title="disableDropdown ? 'Unable to retrieve controller list' : ''"
          variant="outline"
        >
          Controllers
          <i aria-hidden="true" class="fas fa-caret-down" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="controller of availableControllers"
            :key="`dropdownControllers-${controller}`"
            :disabled="controllers.includes(controller)"
            @select="addControllerTag(controller)"
          >
            {{ controller }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button data-cy="RolesFilters-resetBtn" variant="outline" @click="resetSearch">Reset</Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input';
import { logger } from '@/plugins/logger';
import { useKuzzleStore } from '@/stores';
import type { RoleFilter } from './types';

const props = defineProps<{
  currentFilter?: RoleFilter | null;
}>();

const emit = defineEmits<{
  (e: 'filters-updated', filter: { controllers: string[] }): void;
}>();

const kuzzleStore = useKuzzleStore();

const controllers = ref<string[]>([]);
const availableControllers = ref<string[]>([]);
const disableDropdown = ref(false);

/* `addController` mute le tableau sur place — voir G-058. */
watch(
  controllers,
  (value) => {
    emit('filters-updated', { controllers: value });
  },
  { deep: true },
);

function resetSearch(): void {
  controllers.value = [];
}

function addControllerTag(controller: string): void {
  if (controllers.value.includes(controller)) {
    return;
  }
  controllers.value.push(controller);
}

async function getKuzzlePublicApi(): Promise<void> {
  try {
    const kuzzle = kuzzleStore.$kuzzle;
    if (!kuzzle) {
      throw new Error('No Kuzzle SDK for the current environment');
    }
    const publicApi = await kuzzle.query({
      controller: 'server',
      action: 'publicApi',
    });
    availableControllers.value = Object.keys(publicApi.result);
  } catch (error) {
    disableDropdown.value = true;
    logger.error(error);
  }
}

onMounted(() => {
  controllers.value = props.currentFilter?.controllers ? props.currentFilter.controllers : [];
  getKuzzlePublicApi();
});
</script>
