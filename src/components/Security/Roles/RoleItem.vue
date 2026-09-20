<template>
  <div class="tw:px-3" data-cy="RoleItem">
    <div class="tw:flex tw:items-center tw:gap-2 tw:py-1">
      <i
        aria-hidden="true"
        class="fa tw:cursor-pointer tw:px-1"
        :class="`fa-caret-${expanded ? 'down' : 'right'}`"
        :data-cy="`RoleItem-${document._id}--toggle`"
        @click="toggleCollapse"
      />
      <Checkbox
        v-model="checked"
        :data-cy="`RoleItem-checkbox--${document._id}`"
        @change="notifyCheckboxClick"
      />
      <a class="code tw:cursor-pointer" @click="toggleCollapse">{{ document._id }}</a>

      <div class="tw:ms-auto tw:flex tw:items-center">
        <Button
          class="RoleItem-update"
          :data-cy="`RoleItem-update--${document._id}`"
          :disabled="!canEditRole"
          size="icon"
          :title="canEditRole ? 'Edit Role' : 'You are not allowed to edit this role'"
          variant="ghost"
          @click.prevent="update"
        >
          <i class="fa fa-pencil-alt" aria-hidden="true" />
        </Button>
        <Button
          class="RoleItem-delete"
          :data-cy="`RoleItem-delete--${document._id}`"
          :disabled="!canDeleteRole"
          size="icon"
          :title="canDeleteRole ? 'Delete role' : 'You are not allowed to delete this role'"
          variant="ghost"
          @click.prevent="deleteDocument(document._id)"
        >
          <i class="fa fa-trash" aria-hidden="true" />
        </Button>
      </div>
    </div>

    <div v-show="expanded" class="RoleItem-content tw:ms-3 tw:mt-3">
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
  name: 'RoleItem',
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
    ...mapState(useAuthStore, ['canEditRole', 'canDeleteRole']),
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
      if (this.canDeleteRole) {
        this.$emit('delete-document', this.document._id);
      }
    },
    update() {
      if (this.canEditRole) {
        this.$emit('common-list::edit-document', 'SecurityRolesUpdate', this.document._id);
      }
    },
  },
};
</script>
