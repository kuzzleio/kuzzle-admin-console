<template>
  <div :class="{ 'collapsed': collapsed }" class="item-document">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      id="checkbox-{{profile.id}}"
      value="{{profile.id}}"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label for="checkbox-{{profile.id}}" ></label>
    <!-- The following anchor will go to the profile details page -->
    <label class="item-title"><a>{{profile.id}}</a></label>

    <label v-if="profile.additionalAttribute && profile.additionalAttribute.value" class="additional-attribute">
      ({{profile.additionalAttribute.name}}: {{profile.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <dropdown :id="profile.id">
        <li><a @click="deleteUser(profile.id)">Delete</a></li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="profile.content"></pre>
    </div>
  </div>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
import jsonFormatter from '../../../directives/json-formatter.directive'

export default {
  name: 'ProfileItem',
  props: {
    profile: Object,
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
      this.$dispatch('checkbox-click', this.profile.id)
    },
    deleteUser () {
      this.$dispatch('delete-document', this.profile.id)
    }
  }
}
</script>
