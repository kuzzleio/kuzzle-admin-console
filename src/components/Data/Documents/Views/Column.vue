<template>
  <b-col cols="12">
    <b-row no-gutters class="mt-2 mb-2">
      <b-col cols="12">
        <b-alert
          :show="true"
          dismissible
          fade
          style="z-index: 2000;"
          variant="info"
          class="m-0"
        >
          Warning, this view does not allow you to see arrays values.
        </b-alert>
      </b-col>
    </b-row>
    <b-row class="mt-2 mb-2" no-gutters>
      <b-col cols="4">
        <b-dropdown
          variant="outline-secondary"
          menu-class="dropdownScroll"
          text="Select columns to display"
        >
          <b-dropdown-text
            v-for="field of formatedSelectFields"
            :key="`dropdown-${field.text}`"
          >
            <div class="inlineDisplay">
              <span class="inlineDisplay-item">
                <b-form-checkbox
                  class="mx-2"
                  :checked="field.displayed"
                  @change="toggleColumn(field.value)"
                />
              </span>
              <span class="inlineDisplay-item code">{{ field.text }}</span>
            </div>
          </b-dropdown-text>
        </b-dropdown>
      </b-col>
    </b-row>
    <b-row class="mt-2 mb-2" no-gutters>
      <b-col cols="12">
        <b-table
          striped
          bordered
          sticky-header="600px"
          hover
          sort-icon-left
          no-border-collapse
          small
          :fields="formatedTableFields"
          :items="formatedItems"
        >
          <template v-slot:head()="data">
            <div class="inlineDisplay mx-1">
              <span
                class="inlineDisplay-item text-primary m-3 code"
                :id="data.label"
                >{{ getLastKeyPath(data.label) }}</span
              >
              <b-tooltip class="code" placement="top" :target="data.label">
                {{ data.label }}
              </b-tooltip>
              <span class="inlineDisplay-item">
                <i
                  v-if="data.field.deletable"
                  class="fa fa-times-circle text-info m-2"
                  @click="hideColumn(data.field.index)"
                />
              </span>
            </div>
          </template>
          <template v-slot:cell(actions)="data">
            <div class="inlineDisplay">
              <span class="inlineDisplay-item">
                <b-button
                  title="Edit document"
                  variant="link"
                  class="px-0 mx-1"
                  :disabled="!canEdit"
                  @click="editDocument(data.item.id)"
                >
                  <i class="fa fa-pen" />
                </b-button>
              </span>
              <span class="inlineDisplay-item">
                <b-button
                  class="px-0 mx-1 text-danger"
                  title="Delete document"
                  variant="link"
                  :disabled="!canDelete"
                  @click="deleteDocument(data.item.id)"
                >
                  <i class="fa fa-trash" />
                </b-button>
              </span>
              <span class="inlineDisplay-item">
                <b-form-checkbox
                  class="mx-2"
                  :checked="isChecked(data.item.id)"
                  @change="toggleSelectDocument(data.item.id)"
                />
              </span>
            </div>
          </template>
          <template v-slot:cell(id)="data">
            <span class="code">{{ data.item.id }}</span>
          </template>
          <template v-slot:cell()="data">
            <div class="inlineDisplay mx-1">
              <span
                v-if="data.value.null === true"
                class="inlineDisplay-item px-3 code"
              >
                null
              </span>
              <span
                v-if="data.value.undefined === true"
                class="inlineDisplay-item px-3 code"
              >
                undefined
              </span>
              <span
                v-if="data.value.array === true"
                class="inlineDisplay-item px-3 code"
              >
                [...]
              </span>
              <span
                v-if="typeof data.value !== 'object'"
                class="inlineDisplay-item px-3 code valueDisplayer"
                >{{ data.value }}</span
              >
              <b-badge
                pill
                class="mx-1"
                variant="info"
                :id="`tooltip-target-${data.item.id}-${data.field.key}`"
                v-if="data.value.array === true"
              >
                <i class="fa fa-info" />
              </b-badge>
              <b-tooltip
                :target="`tooltip-target-${data.item.id}-${data.field.key}`"
                triggers="hover"
              >
                This value cannot be displayed because it contains or is
                contained in an array.
              </b-tooltip>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-col>
</template>

<script>
import Title from '../../../../directives/title.directive'
import JsonFormatter from '../../../../directives/json-formatter.directive'
import {
  canEditDocument,
  canDeleteDocument
} from '../../../../services/userAuthorization'
import _ from 'lodash'

export default {
  name: 'Column',
  directives: {
    Title,
    JsonFormatter
  },
  props: {
    documents: Array,
    index: String,
    collection: String,
    value: [Object, String, Array],
    mapping: Object,
    isChecked: Function
  },
  data() {
    return {
      mappingArray: [],
      defaultFields: [
        {
          key: 'actions',
          label: '',
          displayed: true,
          deletable: false,
          stickyColumn: true,
          sortable: false,
          thStyle: { width: '20px' },
          thClass: 'align-middle'
        },
        {
          key: 'id',
          displayed: true,
          deletable: false,
          sortable: true,
          tdClass: 'align-middle',
          thClass: 'align-middle'
        }
      ]
    }
  },
  computed: {
    formatedSelectFields() {
      console.log(this.mappingArray)

      return this.mappingArray.map((attr, index) => ({
        value: index,
        text: attr.key,
        displayed: attr.displayed
      }))
    },
    formatedTableFields() {
      return this.defaultFields.concat(
        this.mappingArray
          .map((attr, index) => ({
            key: attr.key,
            index: index,
            sortable: true,
            displayed: attr.displayed,
            deletable: true,
            tdClass: 'align-middle columnClass',
            thClass: 'align-middle'
          }))
          .filter(attr => attr.displayed)
      )
    },
    formatedItems() {
      return this.documents.map(d => {
        const doc = {}
        doc.id = d.id
        for (const { key } of this.formatedTableFields) {
          // each columns path
          if (key === 'id') continue // column id is always ok
          // if there is an array in the current document within the 'path'
          if (this.documentPathContainsArray(key, d)) {
            doc[key] = { array: true }
          } else {
            const parsed = this.parseDocument(key, d)
            if (parsed.value === undefined) {
              doc[key] = { undefined: true }
            } else if (parsed.value === null) {
              doc[key] = { null: true }
            } else {
              doc[key] = parsed.value
            }
          }
        }
        return doc
      })
    },
    canEdit() {
      if (!this.index || !this.collection) {
        return false
      }
      return canEditDocument(this.index, this.collection)
    },
    canDelete() {
      if (!this.index || !this.collection) {
        return false
      }
      return canDeleteDocument(this.index, this.collection)
    },
    checkboxId() {
      return `checkbox-${this.document.id}`
    }
  },
  watch: {
    $route() {
      this.initColumnsFields()
    },
    mapping() {
      this.initColumnsFields()
    }
  },
  mounted() {
    this.initColumnsFields()
  },
  methods: {
    documentPathContainsArray(path, document) {
      let containsArray = false,
        str = ''
      for (const key of path.split('.')) {
        str += key
        if (Array.isArray(this.parseDocument(str, document).realValue)) {
          containsArray = true
        }
        str += '.'
      }
      return containsArray
    },
    getLastKeyPath(label) {
      const splittedLabel = label.split('.')
      return `${splittedLabel.length > 1 ? '...' : ''}${
        splittedLabel[splittedLabel.length - 1]
      }`
    },
    toggleSelectDocument(id) {
      this.$emit('checkbox-click', id)
    },
    initColumnsFields() {
      this.mappingArray = this.buildAttributeList(this.mapping)
      const columnsConfig = JSON.parse(
        localStorage.getItem('columnViewConfig') || {}
      )
      if (
        columnsConfig[this.index] &&
        columnsConfig[this.index][this.collection]
      ) {
        this.mappingArray = this.mappingArray.map((attr, index) => {
          const displayed = _.get(
            columnsConfig,
            `${this.index}.${this.collection}[${index}].displayed`
          )
          if (displayed !== null) {
            attr.displayed = displayed
          }
          return attr
        })
      }
    },
    toggleColumn(index) {
      this.mappingArray[index].displayed = !this.mappingArray[index].displayed
      this.saveToLocalStorage()
    },
    hideColumn(index) {
      this.mappingArray[index].displayed = false
      this.newCustomField = null
      this.saveToLocalStorage()
    },
    toggleJsonFormatter(id) {
      if (this.$refs[id][0].style.visibility === 'hidden') {
        this.$refs[id][0].style.visibility = 'visible'
      } else {
        this.$refs[id][0].style.visibility = 'hidden'
      }
    },
    parseDocument(attr, doc) {
      const ret = attr.includes('.')
        ? this.getNestedField(doc.content, attr)
        : doc.content[attr]

      if (typeof ret === 'object' && ret !== null) {
        return {
          isObject: true,
          value: JSON.stringify(ret).substring(0, 10),
          realValue: ret
        }
      }

      return {
        isObject: false,
        value: ret
      }
    },
    saveToLocalStorage() {
      if (this.index && this.collection) {
        const config = JSON.parse(
          localStorage.getItem('columnViewConfig') || '{}'
        )
        if (!config[this.index]) {
          config[this.index] = {}
        }
        config[this.index][this.collection] = this.mappingArray
        localStorage.setItem('columnViewConfig', JSON.stringify(config))
      }
    },
    getNestedField(doc, customField) {
      return _.get(doc, customField, null)
    },
    deleteDocument(id) {
      if (this.canDelete) {
        this.$emit('delete', id)
      }
    },
    editDocument(id) {
      if (this.canEdit) {
        this.$emit('edit', id)
      }
    },
    buildAttributeList(mapping, path = []) {
      let attributes = []

      for (const [attributeName, attributeValue] of Object.entries(mapping)) {
        if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'properties')
        ) {
          attributes = attributes.concat(
            this.buildAttributeList(
              attributeValue.properties,
              path.concat(attributeName)
            )
          )
        } else if (
          Object.prototype.hasOwnProperty.call(attributeValue, 'type')
        ) {
          attributes = attributes.concat({
            key: path.concat(attributeName).join('.'),
            displayed: false
          })
        }
      }
      return attributes
    }
  }
}
</script>

<style lang="scss">
.inlineDisplay {
  display: table;

  &-item {
    display: table-cell;
  }
}

.dropdownScroll {
  max-height: 150px;
  overflow-y: scroll;
}

.columnClass {
  max-width: 300px;
  min-width: 100px;
  overflow: hidden;
}

.valueDisplayer {
  white-space: nowrap;
  display: inline-block;
}
</style>
