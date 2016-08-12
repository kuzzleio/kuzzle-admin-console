<template>
  <div :class="{ 'collapsed': collapsed }" class="item-document">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      id="checkbox-{{role.id}}"
      value="{{role.id}}"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label for="checkbox-{{role.id}}" ></label>
    <!-- The following anchor will go to the profile details page -->
    <label class="item-title"><a>{{role.id}}</a></label>

    <label v-if="role.additionalAttribute && role.additionalAttribute.value" class="additional-attribute">
      ({{role.additionalAttribute.name}}: {{role.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <dropdown :id="role.id">
        <li><a @click="deleteUser(role.id)">Delete</a></li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="role.content"></pre>
    </div>
  </div>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
import jsonFormatter from '../../../directives/json-formatter.directive'

export default {
  name: 'RoleItem',
  props: {
    role: Object,
    isChecked: Boolean
  },
  components: {
    Dropdown
  },
  directives: {
    jsonFormatter
  },
  data: function () {
    return {
      collapsed: true
    }
  },
  methods: {
    toggleCollapse () {
      this.collapsed = !this.collapsed
    },
    notifyCheckboxClick () {
      this.$dispatch('checkbox-click', this.role.id)
    },
    deleteUser () {
      this.$dispatch('delete-document', this.role.id)
    }
  }
}
</script>
