<template>
  <form class="wrapper collection-form" @submit.prevent="next">

    <div class="row">
      <input type="checkbox" class="filled-in" id="allowForm" @change="changeAllowForm" :checked="$store.state.collection.allowForm"/>
      <label for="allowForm">Allow this collection to display a form during document edition.</label>
    </div>

    <!--<collection-form-name :attributes="flattenMapping"></collection-form-name>-->

    <collection-form-line
      v-for="(type, attributeName, index) in flattenMapping"
      v-if="$store.state.collection.allowForm"
      :name="attributeName"
      :type="type"
      :index="index"
      :choose-values="flattenSchema[attributeName].chooseValues"
      :values="flattenSchema[attributeName].values"
      :value="flattenSchema[attributeName]"
      @input="changeSchema">
    </collection-form-line>

    <div class="row">
      <div class="divider"></div>
    </div>

    <!-- Actions -->
    <div class="row">
      <div class="col s12">
        <button type="submit" class="btn primary waves-effect waves-light right">
          Save
        </button>
        <a tabindex="6" class="btn-flat waves-effect right" @click.prevent="cancel">Cancel</a>
      </div>
    </div>
  </form>
</template>

<script>
  import title from '../../../../directives/title.directive'
  import {SET_SCHEMA, SET_ALLOW_FORM} from '../../../../vuex/modules/collection/mutation-types'
  import CollectionFormLine from './CollectionFormLine'
  import CollectionFormName from './CollectionFormName'

  export default {
    name: 'CollectionForm',
    props: {
      mapping: Object,
      step: Number
    },
    components: {
      CollectionFormLine,
      CollectionFormName
    },
    directives: {
      title
    },
    data () {
      return {
        schema: {},
        allowForm: true
      }
    },
    methods: {
      next () {
        this.$emit('collection-create::create')
      },
      cancel () {
        this.$emit('cancel')
      },
      changeAllowForm (e) {
        this.$store.commit(SET_ALLOW_FORM, e.target.checked)
      },
      changeSchema (event) {
        this.$store.commit(SET_SCHEMA, {...this.schema, [event.name]: event.element})
      }
    },
    computed: {
      flattenMapping () {
        return this.$store.getters.flattenMapping
      },
      flattenSchema () {
        return this.$store.getters.flattenSchemaWithType
      }
    },
    watch: {
      step () {
        if (Object.keys(this.schema).length) {
          this.$store.commit(SET_SCHEMA, this.schema)
        }
      },
      flattenSchema () {
        this.schema = {...this.flattenSchema}
      }
    }
  }
</script>