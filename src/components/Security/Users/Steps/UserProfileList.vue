<template>
  <div class="UserProfileList tw:flex tw:flex-wrap tw:items-center tw:gap-4">
    <div class="tw:min-w-0 tw:flex-1">
      <div v-if="profileList.length">
        <Select :model-value="selectedProfiled" @update:modelValue="onProfileSelected">
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
              class="tw:px-3 tw:py-2 tw:text-sm tw:text-muted-foreground"
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
        <router-link class="tw:text-primary tw:underline" :to="{ name: 'SecurityProfilesCreate' }">
          create one
        </router-link>
        before creating a user)
      </div>
    </div>

    <div class="UserProfileList-badges tw:flex tw:flex-1 tw:flex-wrap tw:items-center tw:gap-2">
      <template v-if="addedProfiles.length">
        <!--
          La corbeille était une icône cliquable posée dans un badge : ni
          atteignable au clavier, ni annoncée. C'est un bouton, et il dit ce
          qu'il retire.
        -->
        <Badge
          v-for="(profile, index) in addedProfiles"
          :key="index"
          class="tw:gap-1 tw:py-1"
          :data-cy="`UserProfileList-badge--${profile}`"
        >
          {{ profile }}
          <button
            :aria-label="`Remove the profile ${profile}`"
            class="UserProfileList-delete tw:cursor-pointer"
            :data-cy="`UserProfileList-${profile}--delete`"
            type="button"
            @click="removeProfile(profile)"
          >
            <i class="fa fa-trash" aria-hidden="true" />
          </button>
        </Badge>
      </template>
      <template v-else>
        <span class="tw:text-secondary">No profiles selected</span>
      </template>
    </div>
  </div>
</template>

<script type="text/javascript">
import { mapState } from 'pinia';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKuzzleStore } from '@/stores';

export default {
  name: 'UserProfileList',
  components: {
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  },
  props: {
    addedProfiles: {
      type: Array,
    },
  },
  data() {
    return {
      profileList: [],
      /*
       * `null` et non `0` : le champ n'a pas de valeur tant qu'aucun profil
       * n'est choisi, et c'est le `placeholder` du `SelectValue` qui porte le
       * « Select a Profile to add ». L'ancien `0` était une option à part
       * entière dans la liste.
       */
      selectedProfiled: null,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
    availableProfiles() {
      return this.profileList
        .filter((profile) => {
          return !this.addedProfiles.includes(profile._id);
        })
        .map((profile) => profile._id)
        .sort();
    },
  },
  mounted() {
    return this.fetchProfileList();
  },
  methods: {
    fetchProfileList() {
      return this.wrapper.performSearchProfiles().then((result) => {
        result.documents.forEach((profile) => {
          this.profileList.push(profile);
        });
      });
    },
    onProfileSelected(profile) {
      if (!profile) {
        return;
      }
      this.$emit('selected-profile', profile);
      this.selectedProfiled = null;
    },
    removeProfile(profile) {
      this.$emit('remove-profile', profile);
    },
  },
};
</script>
