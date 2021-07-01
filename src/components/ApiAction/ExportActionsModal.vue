<template>
  <b-modal
    scrollable
    id="export-actions"
    title="Export API Actions"
    size="lg"
    @ok="handleOk"
    @shown="fetchQueries"
    okTitle="Export"
  >
    <p class="my-4">Select the actions you want to export</p>
    <b-form-checkbox-group v-model="selectedActionIds">
      <b-table small :fields="tableFields" :items="apiActions" responsive="sm">
        <template #cell(checkbox)="data">
          <b-form-checkbox :value="data.item.id" />
        </template>
        <template #cell(name)="data">
          {{ data.item.name.substring(0, 20)
          }}{{ data.item.name.length > 20 ? '...' : '' }}
        </template>
      </b-table>
    </b-form-checkbox-group>
  </b-modal>
</template>

<script>
export default {
  name: 'ExportActionsModal',
  props: {
    tabs: {
      default: []
    }
  },
  data() {
    return {
      apiActions: [],
      selectedActionIds: []
    }
  },
  computed: {
    tableFields() {
      return [
        { key: 'checkbox', label: 'Selected' },
        { key: 'env', label: 'Environment' },
        { key: 'name', label: 'Name' },
        { key: 'query.controller', label: 'Controller' },
        { key: 'query.action', label: 'Action' }
      ]
    },
    currentEnvironmentId() {
      return this.$store.state.kuzzle.currentId
    }
  },
  mounted() {},
  watch: {},
  methods: {
    handleOk() {
      const selectedActions = this.apiActions.filter(action =>
        this.selectedActionIds.includes(action.id)
      )
      selectedActions.map(action => {
        delete action.id
        delete action.idx
        delete action.env
      })
      const data = JSON.stringify(selectedActions)
      const blob = new Blob([data], { type: 'text/plain' })
      const e = document.createEvent('MouseEvents'),
        a = document.createElement('a')
      a.download = 'APIActions.json'
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
      e.initEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      )
      a.dispatchEvent(e)
    },
    fetchQueries() {
      this.apiActions = []
      let storedActions = localStorage.getItem('storedQueries')
      if (!storedActions) {
        this.$bvToast.toast('No saved API Action to export...', {
          title: 'Error',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
        this.$bvModal.hide('export-actions')
      }
      storedActions = JSON.parse(storedActions)
      Object.keys(storedActions).forEach(env => {
        storedActions[env].forEach(action => {
          action.env = env
          action.id = `${env}-${action.name}`
          this.apiActions.push(action)
        })
      })
      this.selectedActionIds = this.tabs
        .filter(tab => tab.saved)
        .map(tab => `${this.currentEnvironmentId}-${tab.name}`)
    }
  }
}
</script>

<style scoped></style>
