<template>
  <aside>
    <ul class="side-nav fixed leftside-navigation ps-container ps-active-y">
      <li>
        <nav>
          <div class="nav-wrapper">
            <form>
              <div class="input-field">
                <input id="search" type="search" required>
                <label for="search"><i class="fa fa-search"></i></label>
              </div>
            </form>
          </div>
        </nav>
      </li>
      <li>
        <treeview :tree="indexesAndCollections"></treeview>
      </li>
    </ul>
  </aside>
  <section>
    <breadcrumb></breadcrumb>

    <section class="view">
      <router-view></router-view>
    </section>
  </section>
</template>

<style lang="scss" scoped>
  section > section {
    margin-top: 50px;
  }
</style>

<script>
  import {listIndexesAndCollections} from '../../vuex/modules/data/actions'
  import {getError} from '../../vuex/modules/common/getters'
  import {indexesAndCollections} from '../../vuex/modules/data/getters'
  import Treeview from './Browse/Treeview'
  import Breadcrumb from './Breadcrumb'

  export default {
    name: 'DataLayout',
    components: {
      Treeview,
      Breadcrumb
    },
    ready () {
      this.listIndexesAndCollections()
    },
    vuex: {
      actions: {
        listIndexesAndCollections
      },
      getters: {
        error: getError,
        indexesAndCollections
      }
    }
  }
</script>
