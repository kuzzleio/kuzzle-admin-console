<template>
  <div
    class="IndexBoxed col s12 m6 l5"
    :title="index"
  >
    <div class="card">
      <div class="card-title row">
        <div class="col s10 truncate">
          <!-- index browse link -->
          <router-link
            class="fluid-hover"
            :to="{name: 'DataIndexSummary', params: {index: index}}"
          >
            <i
              class="fa fa-database grey-text text-darken-1"
              aria-hidden="true"
            />
            <span class="IndexBoxed-name">{{ index }}</span>
          </router-link>
        </div>

        <div class="col s2 right-align">
          <!-- actions related to the index -->
          <index-dropdown
            :index="index"
            class="IndexBoxed-dropdown icon-small icon-black"
          />
        </div>
      </div>

      <div class="card-action right-align">
        <router-link
          v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
          class="btn btn-small"
          :class="{unauthorized: !canCreateCollection(index)}"
          :to="{name: 'DataCreateCollection', params: {index: index}}"
        >
          Create a collection
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import IndexDropdown from './Dropdown'
import { canCreateCollection } from '../../../services/userAuthorization'
import Title from '../../../directives/title.directive'

export default {
  name: 'IndexBoxed',
  directives: {
    Title
  },
  components: {
    IndexDropdown
  },
  props: {
    index: String
  },
  methods: {
    canCreateCollection
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.IndexBoxed-name {
  font-family: 'AnonymousPro', sans-serif;
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
