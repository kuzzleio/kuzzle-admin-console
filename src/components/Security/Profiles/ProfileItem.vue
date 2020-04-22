<template>
  <b-container fluid data-cy="ProfileItem">
    <b-row align-h="between" no-gutters>
      <b-col cols="10" class="py-1">
        <i
          aria-role="button"
          :class="
            `fa fa-caret-${
              expanded ? 'down' : 'right'
            } mr-2  d-inline-block align-middle`
          "
          :data-cy="`ProfileItem-${document.id}--toggle`"
          @click="toggleCollapse"
        />
        <b-form-checkbox
          class="d-inline-block align-middle"
          type="checkbox"
          value="true"
          unchecked-value="false"
          v-model="checked"
          :data-cy="`ProfileListItem-checkbox--${document.id}`"
          :id="checkboxId"
          @change="notifyCheckboxClick"
        />
        <a
          class="d-inline-block align-middle code pointer"
          @click="toggleCollapse"
          >{{ document.id }}</a
        >
        <label
          v-if="
            document.additionalAttribute && document.additionalAttribute.value
          "
          class="ProfileItem-additionalAttribute"
        >
          ({{ document.additionalAttribute.name }}:
          {{ document.additionalAttribute.value }})
        </label>
      </b-col>
      <b-col cols="2">
        <div class="float-right">
          <b-button
            class="ProfileListItem-update"
            href=""
            variant="link"
            :data-cy="`ProfileListItem-update--${document.id}`"
            :disabled="!canEditProfile()"
            :title="
              canEditProfile()
                ? 'Edit Profile'
                : 'You are not allowed to edit this profile'
            "
            @click.prevent="update"
          >
            <i
              class="fa fa-pencil-alt"
              :class="{ disabled: !canEditProfile() }"
            />
          </b-button>
          <b-button
            class="ProfileListItem-delete"
            href=""
            variant="link"
            :data-cy="`ProfileListItem-delete--${document.id}`"
            :disabled="!canDeleteProfile()"
            :title="
              canDeleteProfile()
                ? 'Delete profile'
                : 'You are not allowed to delete this profile'
            "
            @click.prevent="deleteDocument(document.id)"
          >
            <i class="fa fa-trash" :class="{ disabled: !canDeleteProfile() }" />
          </b-button>
        </div>
      </b-col>
    </b-row>

    <b-row>
      <b-collapse
        :id="`collapse-${document.id}`"
        v-model="expanded"
        class="mt-3 ml-3 DocumentListItem-content"
      >
        <pre v-json-formatter="{ content: document.content, open: true }" />
      </b-collapse>
    </b-row>
  </b-container>
</template>

<script>
import jsonFormatter from '../../../directives/json-formatter.directive'
import {
  canEditProfile,
  canDeleteProfile
} from '../../../services/userAuthorization'
import title from '../../../directives/title.directive'

export default {
  name: 'ProfileItem',
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
  computed: {
    checkboxId() {
      return `checkbox-${this.document.id}`
    }
  },
  methods: {
    toggleCollapse() {
      this.expanded = !this.expanded
    },
    notifyCheckboxClick() {
      this.$emit('checkbox-click', this.document.id)
    },
    deleteDocument() {
      if (this.canDeleteProfile()) {
        this.$emit('delete', this.document.id)
      }
    },
    update() {
      if (this.canEditProfile()) {
        this.$emit('edit', this.document.id)
      }
    },
    canEditProfile,
    canDeleteProfile
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

<style lang="scss" scoped>
.ProfileItem-toggle {
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
