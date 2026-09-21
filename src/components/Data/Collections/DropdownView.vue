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
            @select="$emit('list')"
          >
            List view
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            data-cy="CollectionDropdown-column"
            value="column"
            @select="$emit('column')"
          >
            Column view
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            data-cy="CollectionDropdown-TimeSeries"
            :disabled="!mappingHasIntegerField"
            :title="mappingHasIntegerField ? '' : 'This collection has no numeric field to chart'"
            value="time-series"
            @select="$emit('time-series')"
          >
            Chart view
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            data-cy="CollectionDropdown-map"
            :disabled="!mappingHasGeoField"
            :title="mappingHasGeoField ? '' : 'This collection has no geographic field to map'"
            value="map"
            @select="$emit('map')"
          >
            Map view
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            :as="canSubscribeHere ? 'router-link' : 'button'"
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

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { mapState } from 'pinia';
import type { RawLocation } from 'vue-router';

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

export default defineComponent({
  name: 'CollectionDropdownView',
  components: {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
  },
  props: {
    activeView: {
      default: '',
      type: String,
    },
    collection: {
      default: '',
      type: String,
    },
    index: {
      default: '',
      type: String,
    },
    mappingAttributes: {
      default: null,
      type: Object as PropType<MappingAttributes | null>,
    },
  },
  data() {
    return {
      // Le composant passé à `as` n'a pas à être réactif : il est rangé hors
      // de `data()` réactive par `Object.freeze` faute de `markRaw` en Vue 2.
      Button: Object.freeze(Button),
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canSubscribe']),
    attributes(): MappingAttributes {
      return this.mappingAttributes ?? {};
    },
    canSubscribeHere(): boolean {
      return this.canSubscribe(this.index, this.collection);
    },
    mappingHasGeoField(): boolean {
      return Object.values(this.attributes).some((attribute) =>
        ['geo_point', 'geo_shape'].includes(attribute?.type ?? ''),
      );
    },
    mappingHasIntegerField(): boolean {
      return Object.values(this.attributes).some((attribute) => attribute?.type === 'integer');
    },
    watchRoute(): RawLocation {
      return {
        name: 'WatchCollection',
        params: { collection: this.collection, index: this.index },
      };
    },
  },
});
</script>
