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
    <label class="item-title"><a>{{document.id}}</a></label>

    <label v-if="document.additionalAttribute && document.additionalAttribute.value" class="additional-attribute">
      ({{document.additionalAttribute.name}}: {{document.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <dropdown :id="document.id" class="icon-black">
        <li><a @click="deleteDocument(document.id)">Delete</a></li>
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

export default {
  name: 'ProfileItem',
  props: {
    document: Object,
    isChecked: Boolean
  },
  components: {
    Dropdown
  },
  directives: {
    jsonFormatter
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
      this.$dispatch('delete-document', this.document.id)
    }
  }
}
</script>
