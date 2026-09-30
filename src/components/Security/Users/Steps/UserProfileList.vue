<template>
  <div class="UserProfileList flex flex-wrap items-center gap-4">
    <div class="min-w-0 flex-1">
      <div v-if="profileList.length">
        <Select :model-value="selectedProfiled" @update:model-value="onProfileSelected">
          <SelectTrigger aria-label="Add a profile" data-cy="UserProfileList-select">
            <SelectValue placeholder="Select a Profile to add" />
          </SelectTrigger>
          <SelectContent>
            <!--
              `b-select-option` rendait un élément désactivé pour dire qu'il
              n'y a plus rien à choisir. Un choix qu'on ne peut pas faire n'est
              pas un choix : le message prend sa place et n'est plus une option.
            -->
            <p
              v-if="availableProfiles.length === 0"
              class="px-3 py-2 text-sm text-muted-foreground"
            >
              The user has all the profiles (are you sure?)
            </p>
            <SelectItem v-for="profile of availableProfiles" :key="profile" :value="profile">
              {{ profile }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-else>
        No profiles found (you should
        <router-link class="text-primary underline" :to="{ name: 'SecurityProfilesCreate' }">
          create one
        </router-link>
        before creating a user)
      </div>
    </div>

    <div class="UserProfileList-badges flex flex-1 flex-wrap items-center gap-2">
      <template v-if="addedProfiles.length">
        <!--
          La corbeille était une icône cliquable posée dans un badge : ni
          atteignable au clavier, ni annoncée. C'est un bouton, et il dit ce
          qu'il retire.
        -->
        <Badge
          v-for="(profile, index) in addedProfiles"
          :key="index"
          class="gap-1 py-1"
          :data-cy="`UserProfileList-badge--${profile}`"
          variant="info"
        >
          {{ profile }}
          <button
            :aria-label="`Remove the profile ${profile}`"
            class="UserProfileList-delete cursor-pointer"
            :data-cy="`UserProfileList-${profile}--delete`"
            type="button"
            @click="removeProfile(profile)"
          >
            <i class="fa fa-trash" aria-hidden="true" />
          </button>
        </Badge>
      </template>
      <template v-else>
        <span class="text-muted-foreground">No profiles selected</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKuzzleStore } from '@/stores';

const props = defineProps<{
  addedProfiles: string[];
}>();

const emit = defineEmits<{
  (e: 'remove-profile', profile: string): void;
  (e: 'selected-profile', profile: string): void;
}>();

const kuzzleStore = useKuzzleStore();

const profileList = ref<{ _id: string }[]>([]);
/*
 * `null` et non `0` : le champ n'a pas de valeur tant qu'aucun profil
 * n'est choisi, et c'est le `placeholder` du `SelectValue` qui porte le
 * « Select a Profile to add ». L'ancien `0` était une option à part
 * entière dans la liste.
 */
const selectedProfiled = ref<string | null>(null);

const availableProfiles = computed(() =>
  profileList.value
    .filter((profile) => !props.addedProfiles.includes(profile._id))
    .map((profile) => profile._id)
    .sort(),
);

async function fetchProfileList(): Promise<void> {
  const wrapper = kuzzleStore.wrapper;
  if (!wrapper) {
    return;
  }
  const result = await wrapper.performSearchProfiles();
  result.documents.forEach((profile: { _id: string }) => {
    profileList.value.push(profile);
  });
}

onMounted(fetchProfileList);

function onProfileSelected(profile: unknown): void {
  if (!profile) {
    return;
  }
  emit('selected-profile', String(profile));
  selectedProfiled.value = null;
}

function removeProfile(profile: string): void {
  emit('remove-profile', profile);
}
</script>
