<template>
  <div
    class="RoleItem"
    :class="{ 'collapsed': collapsed }"
  >
    <i
      class="RoleItem-toggle fa fa-caret-down item-toggle"
      aria-hidden="true"
      @click="toggleCollapse()"
    />

    <label>
      <input
        :id="checkboxId"
        type="checkbox"
        class="filled-in"
        :value="document.id"
        :checked="isChecked"
        @click="notifyCheckboxClick"
      >

      <span />
    </label>
    <!-- The following anchor will go to the profile details page -->
    <label class="RoleItem-title item-title"><a @click="toggleCollapse">{{ document.id }}</a></label>

    <label
      v-if="document.additionalAttribute && document.additionalAttribute.value"
      class="RoleItem-additionalAttribute"
    >
      ({{ document.additionalAttribute.name }}: {{ document.additionalAttribute.value }})
    </label>

    <div class="RoleItem-actions right">
      <a
        v-title="{active: !canEditRole(), title: 'You are not allowed to edit this role'}"
        href="#"
        @click.prevent="update"
      >
        <i
          class="fa fa-pencil-alt"
          :class="{'disabled': !canEditRole()}"
        />
      </a>
      <dropdown
        :id="document.id"
        myclass="icon-black"
      >
        <li>
          <a
            v-title="{active: !canDeleteRole(), title: 'You are not allowed to delete this role'}"
            :class="{'disabled': !canDeleteRole()}"
            @click="deleteDocument(document.id)"
          >
            Delete</a>
        </li>
      </dropdown>
    </div>

    <div class="RoleItem-content item-content">
      <pre v-json-formatter="{content: document.content, open: true}" />
      <pre v-json-formatter="{content: document.meta, open: true}" />
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
  components: {
    Dropdown
  },
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
      if (this.canDeleteRole()) {
        this.$emit('delete-document', this.document.id)
      }
    },
    update() {
      if (this.canEditRole()) {
        this.$emit(
          'common-list::edit-document',
          'SecurityRolesUpdate',
          this.document.id
        )
      }
    },
    canEditRole,
    canDeleteRole
  }
}
</script>

<style lang="scss" scoped>
.RoleItem-toggle {
  padding: 0 10px;
  margin-left: -10px;
  cursor: pointer;
  transition-duration: 0.2s;
}

/* HACK for centring the checkbox between the caret and the title */
[type='checkbox'] + span:not(.lever) {
  height: 15px;
  padding-left: 30px;
}

.RoleItem-title {
  cursor: pointer;
  font-size: 1rem;
  color: #272727;
}

.RoleItem-content {
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
  .RoleItem-toggle {
    transform: rotate(-90deg);
  }
  .RoleItem-content {
    max-height: 0;
    transition-duration: 0;
    padding: 0 10px 0 0;
  }
}

.RoleItem-additionalAttribute {
  color: grey;
  font-style: italic;
}

.RoleItem-actions {
  margin-top: 1px;
  font-size: 1em;
}
</style>
