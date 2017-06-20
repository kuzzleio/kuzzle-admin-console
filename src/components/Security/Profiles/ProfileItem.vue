<template>
  <div :class="{ 'collapsed': collapsed }" class="item-document">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      :id="checkboxId"
      :value="document.id"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label :for="checkboxId" ></label>
    <!-- The following anchor will go to the profile details page -->
    <label class="item-title"><a @click="toggleCollapse">{{document.id}}</a></label>

    <label v-if="document.additionalAttribute && document.additionalAttribute.value" class="additional-attribute">
      ({{document.additionalAttribute.name}}: {{document.additionalAttribute.value}})
    </label>

    <div class="right actions">
      <a href="#" @click.prevent="update"
         v-title="{active: !canEditProfile(), title: 'You are not allowed to edit this profile'}">
        <i class="fa fa-pencil" :class="{'disabled': !canEditProfile()}"></i>
      </a>
      <dropdown :id="document.id" myclass="icon-black">
        <li><a @click="deleteDocument(document.id)"
               :class="{'disabled': !canDeleteProfile()}"
               v-title="{active: !canDeleteProfile(), title: 'You are not allowed to delete this profile'}">Delete</a>
        </li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="{content: document.content, open: true}"></pre>
    </div>
  </div>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
import jsonFormatter from '../../../directives/json-formatter.directive'
import { canEditProfile, canDeleteProfile } from '../../../services/userAuthorization'
import title from '../../../directives/title.directive'

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
    jsonFormatter,
    title
  },
  data () {
    return {
      collapsed: true
    }
  },
  computed: {
    checkboxId () {
      return `checkbox-${this.document.id}`
    }
  },
  methods: {
    toggleCollapse () {
      this.collapsed = !this.collapsed
    },
    notifyCheckboxClick () {
      this.$emit('checkbox-click', this.document.id)
    },
    deleteDocument () {
      if (this.canDeleteProfile()) {
        this.$emit('delete-document', this.document.id)
      }
    },
    update () {
      if (this.canEditProfile()) {
        this.$emit('common-list::edit-document', 'SecurityProfilesUpdate', this.document.id)
      }
    },
    canEditProfile,
    canDeleteProfile
  }
}
</script>
