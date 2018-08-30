<template>
  <div>

    <headline v-if="!updateId" :title="title"></headline>
    <headline v-else>
      {{title}} - {{updateId}}
    </headline>

    <div class="card-panel">
      <form class="wrapper" @submit.prevent="create">
        <div v-if="!updateId" class="row">
          <div class="col s3">
            <div class="input-field">
              <input id="id" type="text" name="collection" v-model="id"/>
              <label for="id">Identifier</label>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col s6 card">
            <div class="card-content">
              <span class="card-title">{{updateId ? 'Document' : 'New document'}}</span>
              <json-editor :height="400" id="document" class="pre_ace" :content="document" ref="jsoneditor"></json-editor>
            </div>
          </div>
          <div class="col s6 card">
            <div class="card-content">
              <span class="card-title">Mapping</span>
              <json-editor :height="400" id="mapping" class="pre_ace" :content="document" :readonly="true"></json-editor>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col s5 m4 l3">
            <button @click.prevent="cancel" class="btn-flat waves-effect">Cancel</button>
            <button type="submit" class="btn primary waves-effect waves-light">
              <i v-if="!updateId" class="fa fa-plus-circle left"></i>
              <i v-else class="fa fa-pencil left"></i>
              {{updateId ? 'Update' : 'Create'}}
            </button>
          </div>
          <div class="col s7 m8 l9" v-if="error">
            <p class="error card red-color" v-if="error" v-html="error">
            </p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss">
.pre_ace,
.ace_editor {
  height: 350px;
}
.error {
  position: relative;
  padding: 8px 12px;
  margin: 0;
}
.dismiss-error {
  position: absolute;
  right: 10px;
  cursor: pointer;
  padding: 3px;
  border-radius: 2px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}
</style>

<script>
import JsonEditor from '../../Common/JsonEditor'
import Headline from '../../Materialize/Headline'
import { cleanMapping } from '../../../services/documentFormat'

export default {
  props: {
    error: String,
    document: Object,
    title: String,
    updateId: String,
    getMapping: { type: Function, required: true }
  },
  name: 'SecurityCreateOrUpdate',
  components: {
    JsonEditor,
    Headline
  },
  data() {
    return {
      id: null,
      mapping: {}
    }
  },
  computed: {
    cleanedMapping() {
      return cleanMapping(this.mapping)
    }
  },
  methods: {
    dismissError() {
      this.$emit('security-create::reset-error')
    },
    create() {
      this.$emit(
        'security-create::create',
        this.id,
        this.$refs.jsoneditor.getJson()
      )
    },
    cancel() {
      this.$emit('security-create::cancel')
    }
  },
  mounted() {
    this.getMapping(this.collection, this.index)
      .then(res => {
        this.mapping = res.mapping
      })
      .catch(e => {
        // todo errors
      })
  }
}
</script>
