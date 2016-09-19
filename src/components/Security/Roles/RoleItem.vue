<template>
  <div :class="{ 'collapsed': collapsed }" class="item-document">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      id="checkbox-{{document.id}}"
      value="{{document.id}}"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label for="checkbox-{{document.id}}" ></label>
    <!-- The following anchor will go to the profile details page -->
    <label class="item-title"><a @click="toggleCollapse">{{document.id}}</a></label>

    <label v-if="document.additionalAttribute && document.additionalAttribute.value" class="additional-attribute">
      ({{document.additionalAttribute.name}}: {{document.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <a href="#" @click.prevent="update"
          v-title="{active: !canEditRole(), title: 'You are not allowed to edit this role'}">
          <i class="fa fa-pencil" :class="{'disabled': !canEditRole()}"></i>
      </a>
      <dropdown :id="document.id" class="icon-black">
        <li><a @click="deleteDocument(document.id)"
               :class="{'disabled': !canDeleteRole()}"
               v-title="{active: !canDeleteRole(), title: 'You are not allowed to delete this role'}">
          Delete</a>
        </li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="document.content"></pre>
    </div>
  </div>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
import jsonFormatter from '../../../directives/json-formatter.directive'
import { canEditRole, canDeleteRole } from '../../../services/userAuthorization'
import title from '../../../directives/title.directive'

export default {
  name: 'RoleItem',
  props: {
    document: Object,
    isChecked: Boolean
  },
  components: {
    Dropdown
  },
  directives: {
    jsonFormatter,
    title
  },
  data () {
    return {
      collapsed: true
    }
  },
  methods: {
    toggleCollapse () {
      this.collapsed = !this.collapsed
    },
    notifyCheckboxClick () {
      this.$dispatch('checkbox-click', this.document.id)
    },
    deleteDocument () {
      if (this.canDeleteRole()) {
        this.$dispatch('delete-document', this.document.id)
      }
    },
    update () {
      if (this.canEditRole()) {
        this.$router.go({name: 'SecurityRolesUpdate', params: {id: this.document.id}})
      }
    },
    canEditRole,
    canDeleteRole
  }
}
</script>
