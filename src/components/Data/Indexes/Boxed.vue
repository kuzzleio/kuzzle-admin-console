<template>
  <div class="col s4">
    <div class="card">
      <div class="card-title row">

        <div class="col s8">
          <!-- index browse link -->
          <a href="#!">
            <i class="fa fa-database grey-text text-darken-1" aria-hidden="true" ></i>
            <span>My index</span>
          </a>
        </div>

        <div class="col s4 right-align">
          <!-- actions related to the index -->
          <index-dropdown></index-dropdown>
        </div>


      </div>

      <!-- index summary, can be removed in first time -->
      <div class="card-content">
        <div class="row">
          <div class="col s6">Total documents</div>
          <div class="col s6 right-align">1 567</div>
        </div>
        <div class="row">
          <div class="col s6">Index Size</div>
          <div class="col s6 right-align">64 mb</div>
        </div>
        <div class="row">
          <div class="col s5">Auto refresh</div>
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
        <a class="btn btn-small" href="#">Add a collection</a>
      </div>
    </div>
  </div>
</template>

<script>
  import IndexDropdown from './Dropdown.vue'

  export default {
    name: 'IndexBoxed',
    props: ['index'],
    components: {
      IndexDropdown
    }
  }
</script>

<style lang="scss" scoped>
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
