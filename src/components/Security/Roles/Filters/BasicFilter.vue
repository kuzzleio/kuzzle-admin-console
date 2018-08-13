<template>
  <form @submit.prevent="search">
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
          placeholder="Search by controller..."
          :multiple="true">
        </multiselect>
      </div>
    </div>
    <div class="col s3 actions-quicksearch">
      <button type="submit" class="btn btn-small waves-effect waves-light">Search</button>
      <button class="btn-flat btn-small waves-effect waves-light" @click="resetSearch">reset</button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.search-bar {
  border: none;
  height: auto;

  i.search {
    margin-left: 10px;
  }
  .multiselect__select {
    display: none;
  }
  input:focus {
    border: none;
    box-shadow: none;
  }
  .multiselect__tags {
    background: none;
    padding-top: 0;
    padding-left: 40px;

    .multiselect__tag {
      margin-top: 13px;
      background-color: #3498db;
    }
  }
  input {
    width: auto;
    padding: 0;
    border: none;
  }
  ul.multiselect__content {
    z-index: 99;
    li.multiselect__element {
      z-index: 99;
    }
  }
}
.actions-quicksearch {
  height: 48px;
  line-height: 48px;
}
</style>

<script>
import MSelect from '../../../Common/MSelect'
import Multiselect from 'vue-multiselect'
import {} from 'vue-multiselect/dist/vue-multiselect.min.css'

export default {
  components: {
    MSelect,
    Multiselect
  },
  data() {
    return {
      controllers: []
    }
  },
  methods: {
    search() {
      if (this.controllers.length === 0) {
        this.$emit('filters-basic-search', {})
        return
      }

      this.$emit('filters-basic-search', { controllers: this.controllers })
    },
    resetSearch() {
      this.controllers = []
    },
    addController(value) {
      if (this.controllers.indexOf(value) !== -1) {
        return
      }

      this.controllers.push(value)
    },
    removeController(removedValue) {
      this.controllers = this.controllers.filter(
        value => value !== removedValue
      )
    }
  },
  mounted() {
    const controllersInQuery = JSON.parse(
      this.$store.state.route.query.basicFilter || '{}'
    )

    if (
      controllersInQuery.controllers &&
      controllersInQuery.controllers.length > 0
    ) {
      this.controllers = []

      controllersInQuery.controllers.forEach(controller => {
        this.controllers.push(controller)
      })
    }
  }
}
</script>
