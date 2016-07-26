<template>
  <headline title="Indexes - Browse"></headline>

  <div class="row">
  <div class="col s8">
    <div class="row">
      <div class="col s10">
        <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
      </div>
      <div class="col s2">
        <div class="input-field">
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


      <div class="col s4">
        <a  class="card-title" href="#">
          <div class="card-panel hoverable">
            <div class="card-content">
              There is no indexes yet. You may want to create a new one ?
            </div>
          </div>
        </a>
      </div>


      <div class="col s4">
        <div class="card">
          <div class="card-content">
            <div class="card-title row">

              <div class="col s8">
                <span>My index</span>
              </div>
              <div class="col s4 right-align">
                <i class="dropdown-button fa fa-ellipsis-v" data-activates='dropdown1' aria-hidden="true"></i>
              </div>

              <ul id='dropdown1' class='dropdown-content'>
                <li><a href="#!">one</a></li>
                <li><a href="#!">two</a></li>
                <li class="divider"></li>
                <li><a href="#!">three</a></li>
              </ul>
            </div>

            foo

            <div class="card-action">
              <a href="#">This is a link</a>
              <a href="#">This is a link</a>
            </div>

          </div>
        </div>
      </div>


      <div class="col s4">
        <a  class="card-title" href="#">
          <div class="card-panel hoverable">
            <div class="card-content">
              There is no indexes yet. You may want to create a new one ?
            </div>
          </div>
        </a>
      </div>
      </div>

    </div>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline.vue'

  export default {
    name: 'IndexesList',
    components: {
      Headline
    },
    ready () {
      /*eslint no-undef: 0*/
      $('.dropdown-button').dropdown({
        constrain_width: false,
        belowOrigin: false
      })
      console.log($(this.$el).find('.dropdown-button'))
    }
  }
</script>
