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

        <json-editor
          v-ref:jsoneditor
          class="pre_ace"
          :content="content">
        </json-editor>

        <button @click.prevent="cancel" class="btn-flat waves-effect">Cancel</button>
        <button type="submit" class="btn waves-effect waves-light">
          <i v-if="!updateId" class="fa fa-plus-circle left"></i>
          <i v-else class="fa fa-pencil left"></i>
          {{updateId ? 'Update' : 'Create'}}
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss">
  .pre_ace, .ace_editor {
    height: 350px;
  }
</style>

<script>
  import JsonEditor from '../../Common/JsonEditor'
  import Headline from '../../Materialize/Headline'

  export default {
    props: {
      content: Object,
      title: String,
      updateId: String
    },

    components: {
      JsonEditor,
      Headline
    },
    data () {
      return {
        id: null
      }
    },
    methods: {
      create () {
        this.$dispatch('security-create::create', this.id, this.$refs.jsoneditor.getJson())
      },
      cancel () {
        this.$dispatch('security-create::cancel')
      }
    }
  }
</script>
