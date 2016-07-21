<template>
  <div class="row">
    <div class="col s12">
      <span class="head">{{$route.params.collection}} - Summary
        <dropdown id="collection-options">
          <li><a>Star this collection</a></li>
          <li class="divider"></li>
          <li><a>Details</a></li>
          <li><a>Browse documents</a></li>
          <li><a>Watch messages</a></li>
          <li><a>View profiles</a></li>
          <li class="divider"></li>
          <li><a>Edit</a></li>
          <li><a>Clone</a></li>
          <li><a>Duplicate (with content)</a></li>
          <li><a>Rename</a></li>
          <li><a>Truncate</a></li>
        </dropdown>
      </span>
    </div>

    <div class="col s12">
      <p><strong>Collection schema </strong><a class="btn waves-effect waves-light" v-link="{name: 'EditIndex'}" @click="$broadcast('modal-open', 'edit-schema-modal')"><i class="fa fa-pencil"></i> Edit schema</a></p>
      <json-editor id="editor" class="editor col s5" :content="mapping" readonly="true"></json-editor>
    </div>
  </div>
</template>

<style type="text/css" media="screen">
  .editor {
    min-height: 300px;
  }

  .clickable {
    cursor: pointer
  }

  .head {
    float: left;
    font-size: 3rem;
  }

</style>

<script>
import { getMapping } from '../../../vuex/modules/data/actions'
import { getError } from '../../../vuex/modules/common/getters'
import { mapping } from '../../../vuex/modules/data/getters'
import JsonEditor from '../../Common/JsonEditor'
import Dropdown from '../../Materialize/Dropdown'

export default {
  components: {
    JsonEditor,
    Dropdown
  },
  route: {
    data () {
      this.getMapping(this.$route.params.index, this.$route.params.collection)
    }
  },
  vuex: {
    actions: {
      getMapping
    },
    getters: {
      error: getError,
      mapping
    }
  }
}
</script>
