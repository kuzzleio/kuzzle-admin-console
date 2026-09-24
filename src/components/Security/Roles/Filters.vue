<template>
  <Card class="RolesFilters" data-cy="RolesFilters">
    <CardContent class="flex flex-wrap items-center gap-2">
      <div class="RolesFilters-searchBar flex min-w-0 flex-1 items-center gap-2">
        <i class="RolesFilters-searchIcon fa fa-search text-muted-foreground" aria-hidden="true" />
        <TagsInput v-model="controllers" class="min-w-0 flex-1">
          <TagsInputItem v-for="controller of controllers" :key="controller" :value="controller">
            <TagsInputItemText>{{ controller }}</TagsInputItemText>
            <TagsInputItemDelete :value="controller" />
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

<script>
import { markRaw } from 'vue';
import { mapState } from 'pinia';

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
import { useKuzzleStore } from '@/stores';

export default {
  name: 'RolesFilters',
  components: {
    Button,
    Card,
    CardContent,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    TagsInput,
    TagsInputInput,
    TagsInputItem,
    TagsInputItemDelete,
    TagsInputItemText,
  },
  props: {
    currentFilter: Object,
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
  },
  data() {
    return {
      /* `DropdownMenuTrigger` prend le composant en prop `as`, pas son nom. */
      Button: markRaw(Button),
      controllers: [],
      availableControllers: [],
      disableDropdown: false,
    };
  },
  watch: {
    controllers: {
      /* `addController` mute le tableau sur place — voir G-058. */
      deep: true,
      handler(value) {
        this.$emit('filters-updated', { controllers: value });
      },
    },
  },
  mounted() {
    this.controllers =
      this.currentFilter && this.currentFilter.controllers ? this.currentFilter.controllers : [];
    this.getKuzzlePublicApi();
  },
  methods: {
    resetSearch() {
      this.controllers = [];
    },
    addControllerTag(controller) {
      if (this.controllers.includes(controller)) {
        return;
      }
      this.controllers.push(controller);
    },
    async getKuzzlePublicApi() {
      try {
        const publicApi = await this.$kuzzle.query({
          controller: 'server',
          action: 'publicApi',
        });
        this.availableControllers = Object.keys(publicApi.result);
      } catch (error) {
        this.disableDropdown = true;
        this.$log.error(error);
      }
    },
  },
};
</script>
