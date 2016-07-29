<template>
  <div class="col s4">
    <div class="card">
      <div class="card-title row">

        <div class="col s11">
          <!-- collection browse link -->
          <a href="#!"
             v-link="{name: 'DataCollectionBrowse', params: {index: $route.params.index, collection: collection}}">
            <i class="fa grey-text text-darken-1" :class="isRealtime ? 'fa-bolt' : 'fa-th-list'" aria-hidden="true" ></i>
            <span>{{collection}}</span>
          </a>
        </div>

        <div class="col s1 right-align">
          <!-- actions related to the index -->
          <collection-dropdown class="icon-small icon-black" :id="collection" :is-realtime="isRealtime"></collection-dropdown>
        </div>


      </div>

      <!-- collection summary
      <div class="card-content">

      </div>
      -->

      <div class="card-action right-align">
        <a class="btn btn-small" href="#">Create a document</a>
      </div>
    </div>
  </div>
</template>

<script>
  import CollectionDropdown from './Dropdown.vue'

  export default {
    name: 'CollectionBoxed',
    props: ['collection', 'isRealtime'],
    components: {
      CollectionDropdown
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .card-title {
    font-size: 22px;
    padding: 1rem;
    margin-bottom: 0;

    .fa-th-list,
    .fa-bolt {
      font-size: 1.1rem;
      vertical-align: 2px;
      margin-right: 4px;
    }

    .fa-th-list {
      vertical-align: 0;
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
