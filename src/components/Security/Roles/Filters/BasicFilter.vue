<template>
  <!--<form @submit.prevent="search">-->
    <!--<div class="row filter-content margin-bottom-0">-->
      <!--<div class="col s12">-->

        <!--<div class="row block-and margin-bottom-0">-->
          <!--<p><i class="fa fa-search"></i> Search by controllers</p>-->

            <!--<div v-for="(filter, filterIndex) in controllers" class="row dots group">-->
              <!--<div class="col s4">-->
                <!--<input placeholder="controller" type="text" class="validate" v-model="filter.value">-->
              <!--</div>-->
              <!--<div class="card-action" v-if="filterIndex === controllers.length - 1">-->
                <!--<button type="submit" class="btn btn-small waves-effect waves-light">Search</button>-->
                <!--<button class="btn-flat waves-effect waves-light" @click="resetSearch">Reset</button>-->
              <!--</div>-->
            <!--</div>-->
        <!--</div>-->
      <!--</div>-->
    <!--</div>-->
  <!--</form>-->
  <div class="row" >
    <form class="" @submit.prevent="search">
      <div class="col s7">
        <div class="search-bar">
          <i class="fa fa-search search"></i>
          <multiselect
            :options="[]"
            :taggable="true"
            tag-placeholder="Add filter on this controller"
            @tag="addController"
            @remove="removeController"
            :value="controllers"
            placeholder="Search by controller"
            :multiple="true">
          </multiselect>
        </div>
      </div>
      <div class="col s3 actions-quicksearch">
        <button type="submit" class="btn btn-small waves-effect waves-light">Search</button>
        <button class="btn-flat btn-small waves-effect waves-light" @click="resetSearch">reset</button>
      </div>
    </form>
  </div>
</template>

<script>
  import MSelect from '../../../Common/MSelect'
  import Multiselect from 'vue-multiselect'
  import {} from 'vue-multiselect/dist/vue-multiselect.min.css'

  export default {
    components: {
      MSelect,
      Multiselect
    },
    data () {
      return {
        controllers: []
      }
    },
    methods: {
      search () {
        if (this.controllers.length === 0) {
          this.$emit('filters-basic-search', {})
          return
        }

        this.$emit('filters-basic-search', {controllers: this.controllers})
      },
      resetSearch () {
        this.controllers = []
      },
      addController (value) {
        this.controllers.push(value)
      },
      removeController (removedValue) {
        this.controllers = this.controllers
          .filter((value) => value !== removedValue)
      }
    },
    mounted () {
      const controllersInQuery = JSON.parse(this.$store.state.route.query.basicFilter || '{}')

      if (controllersInQuery.controllers && controllersInQuery.controllers.length > 0) {
        this.controllers = []

        controllersInQuery.controllers.forEach(controller => {
          this.controllers.push(controller)
        })
      }
    }
  }
</script>
