<template>
  <form class="wrapper collection-form" @submit.prevent="next">

    <div class="row" v-for="(type, attributeName, index) in flattenMapping">
      <p class="col s3 truncate">{{attributeName}}</p>
      <div class="col s4">
        <m-select v-model="schema[attributeName]">
          <option v-for="option in optionsForAttribute(attributeName)" :value="option.id">{{option.name}}</option>
        </m-select>
      </div>
      <i
        class="fa fa-question-circle info"
        v-if="type === 'force-json'"
        v-title="{active: true, position: 'bottom', title: 'This object has too many levels, the view json is forced for this attribute.'}">
      </i>
    </div>

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
  import {flattenMapping, getSchemaForType, getDefaultSchemaForType} from '../../../../services/collectionHelper'
  import MSelect from '../../../Common/MSelect'
  import title from '../../../../directives/title.directive'

  export default {
    name: 'CollectionForm',
    props: {
      mapping: Object
    },
    components: {
      MSelect
    },
    directives: {
      title
    },
    data () {
      return {
        schema: {}
      }
    },
    methods: {
      next () {
        console.log('ok')
      },
      cancel () {
        this.$emit('cancel')
      },
      optionsForAttribute (attribute) {
        return getSchemaForType(this.flattenMapping[attribute])
      },
      updateSchema () {
        Object.keys(this.flattenMapping).forEach(attribute => {
          this.schema[attribute] = getDefaultSchemaForType(this.flattenMapping[attribute]).id
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
      }
    }
  }
</script>