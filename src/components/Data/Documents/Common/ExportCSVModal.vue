<template>
  <b-modal
    :id="modalId"
    ok-title="OK, only export visible elements"
    size="lg"
    @ok="$emit('ok')"
  >
    <p>
      Please, be aware that the documents that will be exported, are ONLY the
      ones that are currently displayed and NOT the whole collection.
    </p>
    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-1 variant="link"
          >Learn how to export ALL the documents in the collection</b-button
        >
      </b-card-header>
      <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text
            >Full collection CSV export is performed by
            <a href="https://github.com/kuzzleio/kourou">Kourou</a>, our CLI
            interface. If you don't have Kourou installed on your computer or
            you are not familiar with Kourou, please refer to its
            <a href="">README.md</a>.
          </b-card-text>
          <b-card-text
            >Once you have Kourou installed on your system, please open a
            terminal window and copy-paste the following command
          </b-card-text>

          <b-card-text>
            <pre class="code" ref="kourouCommand">{{ kourouCmd }}</pre>
          </b-card-text>
          <div class="text-right">
            <b-button variant="info" @click="copyCommandToClipboard">
              <i class="far fa-clipboard"></i> Copy command to
              clipboard</b-button
            >
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </b-modal>
</template>

<script>
export default {
  name: 'ExportCSVModal',
  props: {
    modalId: {
      type: String,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    index: {
      type: String,
      required: true
    },
    host: {
      type: String,
      required: true
    },
    port: Number,
    ssl: Boolean,
    token: String,
    selectedFields: {
      type: Array,
      required: true
    }
  },
  computed: {
    kourouCmd() {
      return (
        `kourou collection:export ${this.index} ${
          this.collection
        } --format csv --fields ${this.selectedFields.join(',')} --host ${
          this.host
        } --port ${this.port}` +
        (this.ssl ? ' --ssl' : '') +
        (this.token ? ` --api-key ${this.token}` : '')
      )
    }
  },
  methods: {
    copyCommandToClipboard() {
      navigator.clipboard.writeText(this.kourouCmd)
    }
  }
}
</script>

<style></style>
