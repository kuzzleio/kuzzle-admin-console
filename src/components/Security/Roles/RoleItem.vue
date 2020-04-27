<template>
  <b-container fluid data-cy="RoleItem">
    <b-row align-h="between" no-gutters>
      <b-col cols="10" class="py-1 vertical-align">
        <i
          aria-hidden="true"
          :class="
            `fa fa-caret-${
              expanded ? 'down' : 'right'
            } mr-2  d-inline-block align-middle`
          "
          :data-cy="`RoleItem-${document._id}--toggle`"
          @click="toggleCollapse"
        />
        <b-form-checkbox
          class="d-inline-block align-middle"
          type="checkbox"
          value="true"
          unchecked-value="false"
          v-model="checked"
          :data-cy="`RoleItem-checkbox--${document._id}`"
          @change="notifyCheckboxClick"
        />
        <a
          class="d-inline-block align-middle code pointer mr-2"
          @click="toggleCollapse"
          >{{ document._id }}</a
        >
      </b-col>
      <b-col class="text-right">
        <b-button
          class="RoleItem-update"
          href=""
          variant="link"
          :data-cy="`RoleItem-update--${document._id}`"
          :disabled="!canEditRole()"
          :title="
            canEditRole()
              ? 'Edit Role'
              : 'You are not allowed to edit this role'
          "
          @click.prevent="update"
        >
          <i class="fa fa-pencil-alt" :class="{ disabled: !canEditRole() }" />
        </b-button>
        <b-button
          class="RoleItem-delete"
          href=""
          variant="link"
          :data-cy="`RoleItem-delete--${document._id}`"
          :disabled="!canDeleteRole()"
          :title="
            canDeleteRole()
              ? 'Delete role'
              : 'You are not allowed to delete this role'
          "
          @click.prevent="deleteDocument(document._id)"
        >
          <i class="fa fa-trash" :class="{ disabled: !canDeleteRole() }" />
        </b-button>
      </b-col>
    </b-row>

    <b-row>
      <b-collapse v-model="expanded" class="mt-3 ml-3 RoleItem-content">
        <pre v-json-formatter="{ content: document, open: true }" />
      </b-collapse>
    </b-row>
  </b-container>
</template>

<script>
import jsonFormatter from '../../../directives/json-formatter.directive'
import { canEditRole, canDeleteRole } from '../../../services/userAuthorization'
import title from '../../../directives/title.directive'

export default {
  name: 'RoleItem',
  components: {},
  directives: {
    jsonFormatter,
    title
  },
  props: {
    document: Object,
    isChecked: Boolean
  },
  data() {
    return {
      expanded: false,
      checked: false
    }
  },
  methods: {
    toggleCollapse() {
      this.expanded = !this.expanded
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document._id)
    },
    deleteDocument() {
      if (this.canDeleteRole()) {
        this.$emit('delete-document', this.document._id)
      }
    },
    update() {
      if (this.canEditRole()) {
        this.$emit(
          'common-list::edit-document',
          'SecurityRolesUpdate',
          this.document._id
        )
      }
    },
    canEditRole,
    canDeleteRole
  },
  watch: {
    isChecked: {
      handler(value) {
        this.checked = value
      }
    }
  }
}
</script>
