<template>
  <div>
    <headline>
      Edit User Custom Data Mapping
    </headline>

    <div class="card">
      <div class="card-content">
        <p class="flow-text">Here, you will be able to define the fields to be included in Users'
        custom data payload.</p>
      </div>
    </div>

    <div v-show="!loading" class="wrapper collection-edit">
      <stepper
        :current-step="editionStep"
        :steps="['Mapping', 'Form']"
        :disabled-steps="disabledSteps"
        @changed-step="setEditionStep"
        class="card-panel card-header">
      </stepper>
      <div class="row card-panel card-body">
        <div class="col s12">
          <mapping
            v-show="editionStep === 0"
            :current-step="editionStep"
            @change-step="onMappingChangeStep"
            @submit="onMappingSubmit"
            @cancel="onCancel">
          </mapping>
          <form-schema
            v-show="editionStep === 1"
            :current-step="editionStep"
            :mapping="mapping"
            @change-step="onFormSchemaChangeStep"
            @submit="onFormSchemaSubmit"
            @cancel="onCancel"
          ></form-schema>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import Headline from '../../Materialize/Headline'
import Stepper from '../../Common/Stepper'
import Mapping from './Steps/Mapping'
import FormSchema from '../../Common/MappingForm/Form'
import { getMappingUsers } from '../../../services/kuzzleWrapper'

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
      editionStep: 0,
      disabledSteps: [],
      mapping: {},
      formSchema: {},
      allowForm: false,
      loading: false
    }
  },
  methods: {
    setEditionStep (value) {
      this.editionStep = value
    },
    onFormSchemaChangeStep (payload) {
      this.onFormSchemaSubmit(payload)
      this.save()
    },
    onFormSchemaSubmit (payload) {
      this.formSchema = payload.schema || {}
      this.allowForm = payload.allowForm
    },
    onMappingChangeStep (mapping) {
      this.onMappingSubmit(mapping)
      this.setEditionStep(this.editionStep + 1)
    },
    onMappingSubmit (mapping) {
      const newMapping = mapping || {}
      this.mapping = newMapping
    },
    onCancel () {

    },
    save () {

    }
  },
  mounted () {
    this.loading = true
    return getMappingUsers()
    .then(mapping => {
      this.mapping = mapping.content || {}
      this.schema
      this.loading = false
    })
  }
}
</script>
