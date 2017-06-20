<template>
  <form @submit.prevent="createEnvironment">
    <modal id="create-env" :footer-fixed="true" :is-open="isOpen" :close="close">
      <div class="row">
        <div class="col s12">
          <h4>{{environmentId ? 'Update' : 'Create'}} environment</h4>
          <div class="divider"></div>
        </div>
      </div>

      <create-environment
        :environment-id="environmentId"
        ref="createEnvironmentComponent"
        >
      </create-environment>

      <span slot="footer">
        <button type="submit" class="waves-effect btn">
            {{environmentId ? 'Update' : 'Create'}}
        </button>
        <button class="btn-flat waves-effect waves-grey" @click.prevent="close">
            Cancel
        </button>
      </span>
    </modal>
  </form>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>

</style>

<script>
  import Modal from '../../Materialize/Modal'
  import CreateEnvironment from './CreateEnvironment'

  export default {
    name: 'EnvironmentsCreateModal',
    props: ['environmentId', 'isOpen', 'close'],
    components: {
      Modal,
      CreateEnvironment
    },
    methods: {
      createEnvironment () {
        try {
          this.$refs.createEnvironmentComponent.createEnvironment()
          this.close()
        } catch (e) {
        }
      }
    }
  }
</script>
