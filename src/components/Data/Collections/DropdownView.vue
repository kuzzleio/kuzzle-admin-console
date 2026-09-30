<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      :as="Button"
      data-cy="CollectionDropdownView"
      :title="`Change the view of ${collection}`"
      variant="outline"
    >
      <strong>View</strong>
      <i aria-hidden="true" class="fa fa-caret-down" />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuGroup>
        <DropdownMenuLabel>View type</DropdownMenuLabel>
        <DropdownMenuRadioGroup :model-value="activeView">
          <DropdownMenuRadioItem
            data-cy="CollectionDropdown-list"
            value="list"
            @select="emit('list')"
          >
            List view
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            data-cy="CollectionDropdown-column"
            value="column"
            @select="emit('column')"
          >
            Column view
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            data-cy="CollectionDropdown-TimeSeries"
            :disabled="!mappingHasIntegerField"
            :title="mappingHasIntegerField ? '' : 'This collection has no numeric field to chart'"
            value="time-series"
            @select="emit('time-series')"
          >
            Chart view
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            data-cy="CollectionDropdown-map"
            :disabled="!mappingHasGeoField"
            :title="mappingHasGeoField ? '' : 'This collection has no geographic field to map'"
            value="map"
            @select="emit('map')"
          >
            Map view
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            :as="canSubscribeHere ? RouterLink : 'button'"
            data-cy="CollectionDropdown-realtime"
            :disabled="!canSubscribeHere"
            :title="
              canSubscribeHere ? '' : 'Your rights do not allow you to subscribe to this collection'
            "
            :to="canSubscribeHere ? watchRoute : undefined"
            value="realtime"
          >
            Realtime view
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores';

type MappingAttributes = Record<string, { type?: string }>;

const props = withDefaults(
  defineProps<{
    activeView?: string;
    collection?: string;
    index?: string;
    mappingAttributes?: MappingAttributes | null;
  }>(),
  { activeView: '', collection: '', index: '', mappingAttributes: null },
);

const emit = defineEmits<{
  (e: 'column'): void;
  (e: 'list'): void;
  (e: 'map'): void;
  (e: 'time-series'): void;
}>();

const authStore = useAuthStore();

const attributes = computed((): MappingAttributes => props.mappingAttributes ?? {});

const canSubscribeHere = computed((): boolean =>
  authStore.canSubscribe(props.index, props.collection),
);

const mappingHasGeoField = computed((): boolean =>
  Object.values(attributes.value).some((attribute) =>
    ['geo_point', 'geo_shape'].includes(attribute?.type ?? ''),
  ),
);

const mappingHasIntegerField = computed((): boolean =>
  Object.values(attributes.value).some((attribute) => attribute?.type === 'integer'),
);

const watchRoute = computed(
  (): RouteLocationRaw => ({
    name: 'WatchCollection',
    params: { collectionName: props.collection, indexName: props.index },
  }),
);
</script>
