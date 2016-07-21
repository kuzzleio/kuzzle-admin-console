<template>
  <div>
    <aside>
      <ul class="side-nav fixed leftside-navigation ps-container ps-active-y">
        <li v-link-active>
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
        <li v-link-active>
          <treeview :tree="indexesAndCollections"></treeview>
        </li>
      </ul>
    </aside>
    <section>
      <div>
        <router-view></router-view>
      </div>
    </section>
  </div>
</template>

<script>
  import {listIndexesAndCollections} from '../../vuex/modules/data/actions'
  import {getError} from '../../vuex/modules/common/getters'
  import {indexesAndCollections} from '../../vuex/modules/data/getters'
  import Treeview from './Browse/Treeview'

  export default {
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
