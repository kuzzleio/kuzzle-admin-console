<template>
  <div class="col s12 m6 l4">
    <div class="card">
      <div class="card-title row">

        <div class="col s11 truncate">
          <!-- index browse link -->
          <a
            class="fluid-hover"
            v-link="{name: 'DataIndexSummary', params: {index: index}}"
            href="#!">
            <i class="fa fa-database grey-text text-darken-1" aria-hidden="true" ></i>
            <span class="name">{{index}}</span>
          </a>
        </div>

        <div class="col s1 right-align">
          <!-- actions related to the index -->
          <index-dropdown :index="index" class="icon-small icon-black"></index-dropdown>
        </div>


      </div>

      <!-- index summary, can be removed in first time -->
      <div class="card-content">
        <!--<div class="row">
          <div class="col s6 truncate">Total documents</div>
          <div class="col s6 right-align">1 567</div>
        </div>
        <div class="row">
          <div class="col s6 truncate">Index Size</div>
          <div class="col s6 right-align">64 mb</div>
        </div>-->
        <div class="row">
          <div class="col s5 truncate">Auto refresh</div>
          <div class="col s7 right-align">
            <div class="switch">
              <label>
                <input type="checkbox">
                <span class="lever"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="card-action right-align">
        <a class="btn btn-tiny"
           href="#"
           v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
           :class="{unauthorized: !canCreateCollection(index)}"
           v-link="canCreateCollection(index) ? {name: 'DataCreateCollection', params: {index: index}} : {}">Create a collection</a>
      </div>
    </div>
  </div>
</template>

<script>
  import IndexDropdown from './Dropdown.vue'
  import {canCreateCollection} from '../../../services/userAuthorization'
  import Title from '../../../directives/title.directive'

  export default {
    name: 'IndexBoxed',
    props: {
      index: String
    },
    methods: {
      canCreateCollection
    },
    directives: {
      Title
    },
    components: {
      IndexDropdown
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .name {
    font-family: "Roboto", sans-serif;
  }
  .card-title {
    font-size: 22px;
    padding: 1rem;
    margin-bottom: 0;

    .fa-database {
      font-size: 1.1rem;
      vertical-align: 2px;
      margin-right: 4px;
    }
  }
  .card-content {
    border-top: 1px solid rgba(160, 160, 160, 0.2);
  }
  .switch {
    label {
      .lever {
        margin: 0;
      }
    }
  }
</style>
