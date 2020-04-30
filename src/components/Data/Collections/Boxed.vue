<template>
  <div class="CollectionBoxed col s12 m6 l4">
    <div class="card">
      <div class="card-title row">
        <div class="col s10 truncate">
          <!-- collection browse link -->
          <router-link class="fluid-hover" :to="collectionLink">
            <i
              class="fa grey-text text-darken-1"
              :class="isRealtime ? 'fa-bolt' : 'fa-th-list'"
              aria-hidden="true"
            />
            <span class="name">{{ collection }}</span>
          </router-link>
        </div>

        <div class="col s2 right-align">
          <!-- actions related to the collection -->
          <collection-dropdown
            class="icon-small icon-black"
            :collection="collection"
            :index="index"
            :is-realtime="isRealtime"
          />
        </div>
      </div>

      <div class="card-action right-align">
        <router-link
          v-if="isRealtime"
          v-title="{
            active: !canManageRealtime(index, collection),
            title:
              'Your rights disallow you to watch realtime messages on collection ' +
              collection +
              ' of index ' +
              index
          }"
          class="btn btn-small"
          :class="{ unauthorized: !canManageRealtime(index, collection) }"
          :to="
            canManageRealtime(index, collection)
              ? {
                  name: 'DataCollectionWatch',
                  params: { index: index, collection: collection }
                }
              : ''
          "
        >
          Watch messages
        </router-link>
        <router-link
          v-else
          v-title="{
            active: !canCreateDocument(index, collection),
            title:
              'Your rights disallow you to create documents on collection ' +
              collection +
              ' of index ' +
              index
          }"
          class="btn btn-small"
          :class="{ unauthorized: !canCreateDocument(index, collection) }"
          :to="
            canCreateDocument(index, collection)
              ? {
                  name: 'DataCreateDocument',
                  params: { index: index, collection: collection }
                }
              : ''
          "
        >
          Create a document
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import CollectionDropdown from './Dropdown'
import {
  canCreateDocument,
  canManageRealtime
} from '../../../services/userAuthorization'
import Title from '../../../directives/title.directive'

export default {
  name: 'CollectionBoxed',
  components: {
    CollectionDropdown
  },
  directives: {
    Title
  },
  props: ['index', 'collection', 'isRealtime'],
  computed: {
    collectionLink() {
      if (this.isRealtime) {
        return {
          name: 'DataCollectionWatch',
          params: { index: this.index, collection: this.collection }
        }
      } else {
        return {
          name: 'DataDocumentsList',
          params: { index: this.index, collection: this.collection }
        }
      }
    }
  },
  methods: {
    canManageRealtime,
    canCreateDocument
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
// @TODO pass this code to BEM
.CollectionBoxed {
  .dropdown-content > li {
    a.remove {
      color: $red-color;
    }
  }
  .name {
    font-family: 'AnonymousPro', sans-serif;
  }
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
}
.switch {
  label {
    .lever {
      margin: 0;
    }
  }
}
</style>
