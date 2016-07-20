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
                    <div class="css-treeview">
                        <ul>
                            <li v-for="(key, index) in indexesAndCollections"><input type="checkbox" :checked="$route.params.index === index.name ? 'checked' : false"  id="item-{{key}}" /><label for="item-{{key}}"><strong>{{index.name}}</strong>&nbsp;<i class="fa fa-ellipsis-v"></i></label>
                                <ul>
                                    <li v-for="collection in index.collections.stored"><a v-link="{name: 'SummaryData', params: {index: index.name, collection: collection}}" class="truncate">{{collection}}</a></li>
                                    <li v-for="collection in index.collections.realtime"><a href="#" class="truncate">{{collection}}</a></li>
                                    <li><strong><a href="#"><i class="fa fa-plus-circle"></i> Add a collection</a></strong></li>
                                </ul>
                                <div class="divider"></div>
                            </li><br>
                            <li><strong><a href="#"><i class="fa fa-plus-circle"></i> Add an index</a></strong></li>
                        </ul>
                    </div>
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
import { listIndexesAndCollections } from '../../vuex/modules/data/actions'
import { getError } from '../../vuex/getters'
import { indexesAndCollections } from '../../vuex/modules/data/getters'

export default {
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
