<template>
  <div :class="{ 'collapsed': collapsed }">
    <i class="fa fa-caret-down item-toggle" aria-hidden="true" @click="toggleCollapse()"></i>

    <input
      type="checkbox"
      class="filled-in"
      id="checkbox-{{document.id}}"
      value="{{document.id}}"
      @click="notifyCheckboxClick" :checked="isChecked"/>

    <label for="checkbox-{{document.id}}"></label>

    <label class="item-title"><a @click="toggleCollapse">{{document.id}}</a></label>

    <div class="right actions">
      <a
        v-link="{name: 'DataUpdateDocument', params: {id: document.id}}"
        v-if="rights.canEdit">
        <i class="fa fa-pencil"></i>
      </a>
      <dropdown v-if="rights.canDelete" :id="document.id" class="icon-black">
        <li><a @click="deleteDocument(document.id)">Delete</a></li>
      </dropdown>
    </div>

    <div class="item-content">
      <pre v-json-formatter="document.content"></pre>
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
    -webkit-user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -ms-user-select: none;
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

  export default {
    name: 'DocumentItem',
    props: {
      document: Object,
      isChecked: Boolean,
      rights: Object
    },
    directives: {
      JsonFormatter
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
        this.$dispatch('checkbox-click', this.document.id)
      },
      deleteDocument () {
        this.$dispatch('delete-document', this.document.id)
      }
    }
  }
</script>
