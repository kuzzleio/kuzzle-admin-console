<template>
  <form class="wrapper collection-form" @submit.prevent="next">

    <div class="row">
      <input type="checkbox" class="filled-in" id="allowForm" v-model="allowForm"/>
      <label for="allowForm">Allow this collection to display a form during document edition.</label>
    </div>

    <!--<collection-form-name :attributes="flattenMapping"></collection-form-name>-->

    <collection-form-line
      v-for="(type, attributeName, index) in flattenMapping"
      v-if="allowForm"
      :name="attributeName"
      :type="type"
      :index="index"
      v-model="schema[attributeName]">
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
  import {flattenMapping, getDefaultSchemaForType} from '../../../../services/collectionHelper'
  import title from '../../../../directives/title.directive'
  import {SET_SCHEMA} from '../../../../vuex/modules/collection/mutation-types'
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
        this.$store.commit(SET_SCHEMA, this.schema)
        this.$emit('collection-create::create')
      },
      cancel () {
        this.$emit('cancel')
      },
      updateSchema () {
        Object.keys(this.flattenMapping).forEach(attribute => {
          if (this.$store.state.collection.schema && this.$store.state.collection.schema[attribute]) {
            this.schema[attribute] = {...this.$store.state.collection.schema[attribute]}
          } else {
            this.schema[attribute] = {...getDefaultSchemaForType(this.flattenMapping[attribute])}
          }
        })
      }
    },
    computed: {
      flattenMapping () {
        return flattenMapping(this.mapping)
      }
    },
    mounted () {
      this.updateSchema()
    },
    watch: {
      mapping () {
        this.updateSchema()
      },
      step () {
        this.$store.commit(SET_SCHEMA, this.schema)
      }
    }
  }
</script>