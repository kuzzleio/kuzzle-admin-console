<template>
  <div class="ProfileItem" :class="{ 'collapsed': collapsed }">
    <i class="ProfileItem-toggle fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      :id="checkboxId"
      :value="document.id"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label :for="checkboxId" ></label>
    <!-- The following anchor will go to the profile details page -->
    <label class="ProfileItem-title item-title"><a @click="toggleCollapse">{{document.id}}</a></label>

    <label v-if="document.additionalAttribute && document.additionalAttribute.value" class="ProfileItem-additionalAttribute">
      ({{document.additionalAttribute.name}}: {{document.additionalAttribute.value}})
    </label>

    <div class="ProfileItem-actions right">
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

    <div class="ProfileItem-content item-content">
      <pre v-json-formatter="{content: document.content, open: true}"></pre>
      <pre v-json-formatter="{content: document.meta, open: true}"></pre>
    </div>
  </div>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
import jsonFormatter from '../../../directives/json-formatter.directive'
import {
  canEditProfile,
  canDeleteProfile
} from '../../../services/userAuthorization'
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
  data() {
    return {
      collapsed: true
    }
  },
  computed: {
    checkboxId() {
      return `checkbox-${this.document.id}`
    }
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document.id)
    },
    deleteDocument() {
      if (this.canDeleteProfile()) {
        this.$emit('delete-document', this.document.id)
      }
    },
    update() {
      if (this.canEditProfile()) {
        this.$emit(
          'common-list::edit-document',
          'SecurityProfilesUpdate',
          this.document.id
        )
      }
    },
    canEditProfile,
    canDeleteProfile
  }
}
</script>

<style lang="scss" scoped>
.ProfileItem-toggle {
  padding: 0 10px;
  margin-left: -10px;
  cursor: pointer;
  transition-duration: 0.2s;
}

/* HACK for centring the checkbox between the caret and the title */
[type='checkbox'] + label {
  height: 15px;
  padding-left: 30px;
}

.ProfileItem-title {
  cursor: pointer;
  font-size: 1rem;
  color: #272727;
}

.ProfileItem-content {
  transition-duration: 0.2s;
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px 10px 0 0;

  pre {
    margin: 0;
    width: 70%;
    display: inline-block;
  }
}

.collapsed {
  .ProfileItem-toggle {
    transform: rotate(-90deg);
  }
  .ProfileItem-content {
    max-height: 0;
    transition-duration: 0;
    padding: 0 10px 0 0;
  }
}

.ProfileItem-additionalAttribute {
  color: grey;
  font-style: italic;
  color: black;
  line-height: 21px;
}

.ProfileItem-actions {
  margin-top: 1px;
  font-size: 1em;
}
</style>

