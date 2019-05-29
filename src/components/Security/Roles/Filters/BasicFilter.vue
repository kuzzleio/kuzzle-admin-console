<template>
  <form
    class="BasicFilter"
    @submit.prevent="search"
  >
    <div class="col s7">
      <div class="BasicFilter-searchBar">
        <i class="BasicFilter-searchIcon fa fa-search" />
        <multiselect
          :options="[]"
          :taggable="true"
          tag-placeholder="Add filter on this controller"
          :value="controllers"
          placeholder="Search by controller..."
          :multiple="true"
          @tag="addController"
          @remove="removeController"
        />
      </div>
    </div>
    <div class="col s3 BasicFilter-actions">
      <button
        type="submit"
        class="btn btn-small waves-effect waves-light"
      >
        Search
      </button>
      <button
        class="btn-flat btn-small waves-effect waves-light"
        @click="resetSearch"
      >
        reset
      </button>
    </div>
  </form>
</template>

<script>
import Multiselect from 'vue-multiselect'
import {} from 'vue-multiselect/dist/vue-multiselect.min.css'

export default {
  name: 'BasicFilter',
  components: {
    Multiselect
  },
  data() {
    return {
      controllers: []
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
  }
}
</script>

<style lang="scss">
.BasicFilter-searchBar {
  border: none;
  height: auto;
  display: flex;
  align-items: center;

  .BasicFilter-searchIcon {
    margin-right: 10px;
  }

  // vue-multiselect overrides
  .multiselect {
    flex-grow: 1;
  }
  .multiselect__tags {
    display: flex;
    align-items: center;
    background: none;
    padding: 0 0 0 0;
    border: none;

    .multiselect__tag {
      margin-top: 13px;
      background-color: $secondary-color;
    }
  }

  .multiselect__select {
    display: none;
  }

  ul.multiselect__content {
    z-index: 99;
    li.multiselect__element {
      z-index: 99;
    }
  }
}
.BasicFilter-actions {
  height: 48px;
  line-height: 48px;
}
</style>
