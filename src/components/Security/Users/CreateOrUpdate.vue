<template>
  <div class="wrapper collection-edit">
    <headline>
      {{headline}}
    </headline>

    <stepper
      :current-step="editionStep"
      :steps="['Basic', 'Credentials', 'Custom']"
      @changed-step="setEditionStep"
      class="card-panel card-header">
    </stepper>

    <div class="row card-panel card-body">
      <div class="col s12">

        <div class="col s7 m8 l8" v-if="error">
          <div class="card error red-color white-text">
            <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
            An error occurred while {{$store.state.route.params.user ? 'updating' : 'creating'}} user: <br>{{error}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  name: "UserCreateOrUpdate",
  props: {
    headline: {
      type: String,
      required: true
    }
  }
}
</script>
