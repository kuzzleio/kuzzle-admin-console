<template>
    <div class="row">
        <h1>{{$route.params.collection}} - Summary</h1>
        <div class="col s5">
            <pre id="editor"></pre>
        </div>
    </div>
</template>

<style type="text/css" media="screen">
    .ace_text-input {
        position: relative;
    }
    #editor {
        min-height: 300px;
    }
</style>

<script>
import { getMapping } from '../../../vuex/modules/data/actions'
import { getError } from '../../../vuex/getters'
import { mapping } from '../../../vuex/modules/data/getters'

let editor

export default {
  ready () {
    /* eslint no-undef: 0 */
    editor = ace.edit('editor')
    editor.session.setMode('ace/mode/json')
    editor.setTheme('ace/theme/tomorrow')
    editor.$blockScrolling = Infinity
  },
  route: {
    data () {
      this.getMapping(this.$route.params.index, this.$route.params.collection, () => {
        /* esling no-undef: 0 */
        editor.setValue(JSON.stringify(this.mapping, null, 4), -1)
      })
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
