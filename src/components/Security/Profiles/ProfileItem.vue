<template>
  <div class="tw:px-3" data-cy="ProfileItem">
    <div class="tw:flex tw:items-center tw:gap-2 tw:py-1">
      <i
        aria-hidden="true"
        class="fa tw:cursor-pointer tw:px-1"
        :class="`fa-caret-${expanded ? 'down' : 'right'}`"
        :data-cy="`ProfileItem-${document._id}--toggle`"
        @click="toggleCollapse"
      />
      <Checkbox
        :id="checkboxId"
        v-model="checked"
        :data-cy="`ProfileListItem-checkbox--${document._id}`"
        @change="notifyCheckboxClick"
      />
      <a class="code tw:cursor-pointer" @click="toggleCollapse">{{ document._id }}</a>
      <span
        v-if="document.additionalAttribute && document.additionalAttribute.value"
        class="tw:text-sm tw:italic tw:text-muted-foreground"
      >
        ({{ document.additionalAttribute.name }}: {{ document.additionalAttribute.value }})
      </span>

      <div class="tw:ms-auto tw:flex tw:items-center">
        <Button
          class="ProfileListItem-update"
          :data-cy="`ProfileListItem-update--${document._id}`"
          :disabled="!canEditProfile"
          size="icon"
          :title="canEditProfile ? 'Edit Profile' : 'You are not allowed to edit this profile'"
          variant="ghost"
          @click.prevent="update"
        >
          <i class="fa fa-pencil-alt" aria-hidden="true" />
        </Button>
        <Button
          class="ProfileListItem-delete"
          :data-cy="`ProfileListItem-delete--${document._id}`"
          :disabled="!canDeleteProfile"
          size="icon"
          :title="
            canDeleteProfile ? 'Delete profile' : 'You are not allowed to delete this profile'
          "
          variant="ghost"
          @click.prevent="deleteDocument(document._id)"
        >
          <i class="fa fa-trash" aria-hidden="true" />
        </Button>
      </div>
    </div>

    <div
      v-show="expanded"
      :id="`collapse-${document._id}`"
      :data-cy="`ProfileListItem-collapse--${document._id}`"
      class="ProfileItem-content tw:ms-3 tw:mt-3 tw:max-h-75 tw:overflow-y-auto"
    >
      <pre v-json-formatter="{ content: document, open: true }" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import jsonFormatter from '@/directives/json-formatter.directive';
import { useAuthStore } from '@/stores';

export default {
  name: 'ProfileItem',
  components: {
    Button,
    Checkbox,
  },
  directives: {
    jsonFormatter,
  },
  props: {
    document: Object,
    isChecked: Boolean,
  },
  data() {
    return {
      expanded: false,
      checked: false,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canEditProfile', 'canDeleteProfile']),
    checkboxId() {
      return `checkbox-${this.document._id}`;
    },
  },
  watch: {
    isChecked: {
      handler(value) {
        this.checked = value;
      },
    },
  },
  methods: {
    toggleCollapse() {
      this.expanded = !this.expanded;
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document._id);
    },
    deleteDocument() {
      if (this.canDeleteProfile) {
        this.$emit('delete', this.document._id);
      }
    },
    update() {
      if (this.canEditProfile) {
        this.$emit('edit', this.document._id);
      }
    },
  },
};
</script>
