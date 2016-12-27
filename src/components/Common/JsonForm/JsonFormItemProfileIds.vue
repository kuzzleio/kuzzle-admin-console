<template>
  <div class="row input-field">
    <multiselect :selected="selected" :options="profiles" placeholder=""
                 @update="setProfileIds" :multiple="true"></multiselect>
    <label :class="{'active': selected.length !== 0}">profileIds</label>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
  .multiselect__tags {
    border: none !important;
    border-bottom: 1px solid #e4e1e1 !important;
    border-radius: 0 !important;
    input[type=text],
    input[type=text]:focus:not([readonly]) {
      border: none;
      box-shadow: none;
      margin: 0;
      padding: 0;
      min-height: 0;
    }
  }
</style>

<script>
  import {SET_PARTIAL} from '../../../vuex/modules/data/mutation-types'
  import kuzzle from '../../../services/kuzzle'
  import Multiselect from 'vue-multiselect'

  export default {
    name: 'JsonFormItemProfileIds',
    props: {
      content: Array,
      name: String,
      type: String,
      fullName: String
    },
    components: {
      Multiselect
    },
    watch: {
      content () {
        if (this.content) {
          this.selected = this.content
          this.$store.dispatch(SET_PARTIAL, {path: 'profileIds', value: this.content})
          this.setPartial('profileIds', this.content)
        }
      }
    },
    mounted () {
      kuzzle
        .security
        .searchProfilesPromise({})
        .then(res => {
          res.profiles.forEach(profile => {
            this.profiles.push(profile.id)
          })

          if (this.content) {
            this.selected = this.content
            this.$store.dispatch(SET_PARTIAL, this.content)
            this.setPartial('profileIds', this.content)
          }
        })
        .catch(err => {
          // todo err
          console.error(err)
        })
    },
    methods: {
      setProfileIds (selected) {
        this.selected = selected
        this.setPartial('profileIds', this.selected)
      }
    },
    data () {
      return {
        profiles: [],
        selected: []
      }
    }
  }
</script>
