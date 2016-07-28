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
    <nav class="subnav">
      <div class="container">
        <ul>
          <li v-link-active>
            <!--<a v-link="{name: 'SummaryData', activeClass: 'active'}">Summary</a>-->
          </li>
        </ul>
      </div>
    </nav>
    <section class="view">
      <router-view></router-view>
    </section>
  </section>
</template>

<style lang="scss" scoped>
  .subnav {
    position: fixed;
    z-index: 100;
    top: 50px;
  }
  section > section {
    margin-top: 100px;
  }
</style>

<script>
  import {listIndexesAndCollections} from '../../vuex/modules/data/actions'
  import {getError} from '../../vuex/modules/common/getters'
  import {indexesAndCollections} from '../../vuex/modules/data/getters'
  import Treeview from './Browse/Treeview'

  export default {
    name: 'DataLayout',
    components: {
      Treeview
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
