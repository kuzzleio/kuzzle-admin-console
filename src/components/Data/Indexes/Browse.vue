<template>
  <div class="wrapper">
    <headline title="Indexes - Browse"></headline>

    <div class="row">
      <div class="col s8">

        <div class="row actions">
          <div class="col s9">
            <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
          </div>

          <!-- filter must be hidden when there is no indexes -->
          <div class="col s3">
            <div class="input-field left-align">
              <label for="filter"><i class="fa fa-search"></i> Filter</label>
              <input id="filter" type="text">
            </div>
          </div>
        </div>

        <div class="row">
          <!-- No index view -->
          <div class="col s12">
            <a  class="card-title" href="#">
              <div class="card-panel hoverable">
                <div class="card-content">
                    There is no indexes yet. You may want to create a new one ?
                </div>
              </div>
            </a>
          </div>

          <!-- Index listing -->
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
          <index-boxed index=""></index-boxed>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

  }
  .input-field {
    margin-top: 0;
    label {
      left: 0;
    }
    input {
      margin-bottom: 0;
    }
  }
</style>

<script>
  import Headline from '../../Materialize/Headline.vue'
  import IndexBoxed from './Boxed.vue'

  export default {
    name: 'IndexesList',
    components: {
      Headline,
      IndexBoxed
    },
    ready () {
      /*eslint no-undef: 0*/
      $('.dropdown-button').dropdown({
        constrain_width: false,
        belowOrigin: false
      })
    }
  }
</script>
