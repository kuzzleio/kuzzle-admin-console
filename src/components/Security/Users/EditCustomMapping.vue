<template>
  <div>
    <headline>
      Edit User Custom Data Mapping
    </headline>

    <div v-show="!loading" class="wrapper collection-edit">
      <div class="card">
        <div class="card-content">
          <p class="flow-text">Here, you will be able to define the fields to be included in Users'
          custom data payload.</p>
        </div>
      </div>
      <div class="card-panel card-body">
        <mapping
          :mapping="mapping"
          @submit="onMappingSubmit"
          @cancel="onCancel">
        </mapping>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
/**
 * This feature is currently freezed.
 */

import Headline from '../../Materialize/Headline'
import Stepper from '../../Common/Stepper'
import Mapping from './Steps/Mapping'
import FormSchema from '../../Common/MappingForm/Form'
import {
  getMappingUsers,
  updateMappingUsers
} from '../../../services/kuzzleWrapper'

export default {
  name: 'UsersCustomMappingWizard',
  components: {
    Headline,
    Stepper,
    Mapping,
    FormSchema
  },
  data () {
    return {
      mapping: {},
      loading: false
    }
  },
  methods: {
    onMappingSubmit (mapping) {
      const newMapping = mapping || {}
      this.mapping = newMapping
      this.save()
    },
    onCancel () {
      this.$router.push({name: 'SecurityUsersList'})
    },
    save () {
      return updateMappingUsers(this.mapping)
        .then(() => {
          this.$router.push({name: 'SecurityUsersList'})
        })
    }
  },
  mounted () {
    this.loading = true
    return getMappingUsers()
      .then(result => {
        this.mapping = result.mapping || {}
        this.loading = false
      })
  }
}
</script>
