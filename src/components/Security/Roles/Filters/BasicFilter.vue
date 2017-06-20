<template>
  <form @submit.prevent="search">
    <div class="row filter-content margin-bottom-0">
      <div class="col s12">

        <div class="row block-and margin-bottom-0">
          <p><i class="fa fa-search"></i> Search by controllers</p>

            <div v-for="(filter, filterIndex) in controllers" class="row dots group">
              <div class="col s4">
                <input placeholder="controller" type="text" class="validate" v-model="filter.value">
              </div>
              <div class="col s2">
                <i class="fa fa-times remove-filter"
                   @click="remove(filterIndex)"></i>
                <a
                    v-if="filterIndex === controllers.length - 1"
                    class="inline btn btn-small waves-effect waves-light"
                    @click="add()">
                  <i class="fa fa-plus left"></i>Add
                </a>
              </div>
              <div class="card-action">
                <button type="submit" class="btn btn-small waves-effect waves-light">Search</button>
                <button class="btn-flat waves-effect waves-light" @click="resetSearch">Reset</button>
              </div>
            </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
  import MSelect from '../../../Common/MSelect'

  export default {
    components: {
      MSelect
    },
    data () {
      return {
        controllers: [{value: null}]
      }
    },
    methods: {
      search () {
        let controllersFilter = []

        this.controllers.forEach(controller => {
          if (controller.value !== null) {
            controllersFilter.push(controller.value)
          }
        })
        if (controllersFilter.length === 0) {
          this.$emit('filters-basic-search', {})
          return
        }

        this.$emit('filters-basic-search', {controllers: controllersFilter})
      },
      resetSearch () {
        this.controllers = [{value: null}]
      },
      add () {
        this.controllers.push({value: null})
      },
      remove (filterIndex) {
        if (!this.controllers[filterIndex]) {
          return false
        }

        if (this.controllers.length === 1) {
          this.resetSearch()
          return
        }

        if (this.controllers.length === 1 && this.controllers[0].length === 1) {
          this.$set(this.controllers[0], 0, {})
          return
        }

        this.controllers.splice(filterIndex, 1)
      }
    },
    mounted () {
      const controllersInQuery = JSON.parse(this.$store.state.route.query.basicFilter || '{}')

      if (controllersInQuery.controllers && controllersInQuery.controllers.length > 0) {
        this.controllers = []

        controllersInQuery.controllers.forEach(controller => {
          this.controllers.push({value: controller})
        })
      }
    }
  }
</script>
