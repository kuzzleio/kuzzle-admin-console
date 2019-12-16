<template>
  <div class="UsersCustomMappingWizard">
    <headline>Edit User Custom Data Mapping</headline>

    <div v-show="!loading" class="wrapper collection-edit">
      <div class="card">
        <div class="card-content">
          <p class="flow-text">
            Here, you will be able to define the fields to be included in Users'
            custom data payload.
          </p>
        </div>
      </div>
      <div class="card-panel card-body">
        <mapping
          :mapping="mapping"
          @submit="onMappingSubmit"
          @cancel="onCancel"
        />
        <div v-if="error" class="ErrorBox card error red-color">
          <i class="ErrorBox-dismissBtn fa fa-times" @click="dismissError()" />
          <p v-html="error" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ErrorBox {
  color: #fff;
  padding: 10px;

  p {
    margin: 0;
  }

  .ErrorBox-dismissBtn {
    float: right;
  }
}
</style>

<script type="text/javascript">
/**
 * This feature is currently freezed.
 */

import Headline from '../../Materialize/Headline'
import Mapping from './Steps/Mapping'
import {
  getMappingUsers,
  updateMappingUsers
} from '../../../services/kuzzleWrapper'

export default {
  name: 'UsersCustomMappingWizard',
  components: {
    Headline,
    Mapping
  },
  data() {
    return {
      mapping: {},
      loading: false,
      error: ''
    }
  },
  async mounted() {
    this.loading = true
    const result = await getMappingUsers()
    this.mapping = result.mapping || {}
    this.loading = false
  },
  methods: {
    onMappingSubmit(mapping) {
      const newMapping = mapping || {}
      this.mapping = newMapping
      this.save()
    },
    onCancel() {
      this.$router.push({ name: 'SecurityUsersList' })
    },
    async save() {
      try {
        await updateMappingUsers(this.mapping)
        this.$router.push({ name: 'SecurityUsersList' })
      } catch (error) {
        this.error = error.message
      }
    },
    dismissError() {
      this.error = ''
    }
  }
}
</script>
