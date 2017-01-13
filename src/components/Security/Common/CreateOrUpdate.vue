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
          ref="jsoneditor"
          class="pre_ace"
          :content="content">
        </json-editor>

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
            <p class="error card red-color" v-if="error">
              <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
              <p v-html="error"></p>
            </p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss">
  .pre_ace, .ace_editor {
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
      background-color: rgba(255, 255, 255, .2);
    }
  }
</style>

<script>
  import JsonEditor from '../../Common/JsonEditor'
  import Headline from '../../Materialize/Headline'

  export default {
    props: {
      error: String,
      content: Object,
      title: String,
      updateId: String
    },
    name: 'SecurityCreateOrUpdate',
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
      dismissError () {
        this.$emit('security-create::reset-error')
      },
      create () {
        this.$emit('security-create::create', this.id, this.$refs.jsoneditor.getJson())
      },
      cancel () {
        this.$emit('security-create::cancel')
      }
    }
  }
</script>
