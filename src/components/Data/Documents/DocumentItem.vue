<template>
  <div :class="{ 'collapsed': collapsed }">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      :id="checkboxId"
      :value="document.id"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label :for="checkboxId"></label>

    <label class="item-title"><a @click="toggleCollapse">{{document.id}}</a></label>

    <div class="right actions">
      <a
        v-if="canEdit"
        href=""
        @click.prevent="$emit('common-list::edit-document', 'DataUpdateDocument', document.id)">
        <i class="fa fa-pencil"></i>
      </a>
      <a
        v-if="!canEdit"
        v-title="{active: !canEdit, title: 'You are not allowed to edit this document'}">
        <i class="fa fa-pencil disabled"></i>
      </a>

      <dropdown :id="document.id" myclass="icon-black">
        <li>
          <a
            v-bind:class="{'disabled': !canDelete}"
            @click="deleteDocument(document.id)"
            v-title="{active: !canDelete, title: 'You are not allowed to delete this document'}">
            Delete
          </a>
        </li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="{content: document.content, open: true}"></pre>
      <pre v-json-formatter="{content: document.meta, open: false}"></pre>
    </div>
  </div>
</template>

<style type="text/css" media="screen" scoped>
  i.item-toggle {
    padding: 0 10px;
    margin-left: -10px;
    cursor: pointer;
    transition-duration: .2s;
  }

  .collapsed i.item-toggle {
    transform: rotate(-90deg);
  }

  /* HACK enabling to click on the title without checking the checkbox */
  label.item-title {
    cursor: pointer;
    font-size: 1rem;
    font-family: "AnonymousPro";
  }


  .item-title a {
    color: #272727;
  }

  /* HACK for centring the checkbox between the caret and the title */
  [type="checkbox"] + label {
    height: 15px;
    padding-left: 30px;
  }

  .item-content {
    transition-duration: .2s;
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 10px 10px 0 0;
  }

  .collapsed .item-content {
    max-height: 0;
    transition-duration: 0;
    padding: 0 10px 0 0;
  }

  .item-content pre {
    margin: 0;
    width: 70%;
    display: inline-block;
  }

  .item-content .profile-list {
    display: inline-block;
    width: 30%;
    vertical-align: top;
    text-align: right;
  }
</style>

<script>
  import JsonFormatter from '../../../directives/json-formatter.directive'
  import Dropdown from '../../Materialize/Dropdown'
  import { canEditDocument, canDeleteDocument } from '../../../services/userAuthorization'
  import title from '../../../directives/title.directive'

  export default {
    name: 'DocumentItem',
    props: {
      index: String,
      collection: String,
      document: Object,
      isChecked: Boolean
    },
    directives: {
      JsonFormatter,
      title
    },
    components: {
      Dropdown
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
        this.$emit('checkbox-click', this.document.id)
      },
      deleteDocument () {
        if (this.canDelete) {
          this.$emit('delete-document', this.document.id)
        }
      }
    },
    computed: {
      canEdit () {
        if (!this.index || !this.collection) {
          return false
        }
        return canEditDocument(this.index, this.collection)
      },
      canDelete () {
        if (!this.index || !this.collection) {
          return false
        }
        return canDeleteDocument(this.index, this.collection)
      },
      checkboxId () {
        return `checkbox-${this.document.id}`
      }
    }
  }
</script>
