<template>
  <b-col cols="12">
    <b-row class="mt-2 ml-0" no-gutters>
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
                  :checked="field.displayed"
                  class="mx-2"
                  @change="toggleColumn(field.value)"
                />
              </span>
              <span class="inlineDisplay-item">{{ field.text }}</span>
            </div>
          </b-dropdown-text>
        </b-dropdown>
      </b-col>
    </b-row>
    <b-row class="mt-2 ml-0 mr-2">
      <b-table
        id="DocumentColumnView-table"
        striped
        sticky-header
        hover
        sort-icon-left
        no-border-collapse
        small
        responsive
        :fields="formatedTableFields"
        :items="formatedItems"
      >
        <template v-slot:head()="data">
          <div class="inlineDisplay mx-1">
            <span :id="data.label" class="inlineDisplay-item text-info m-3">{{
              getLastKeyPath(data.label)
            }}</span>
            <b-tooltip placement="top" :target="data.label">{{
              data.label
            }}</b-tooltip>
            <span class="inlineDisplay-item">
              <i
                v-if="data.field.deletable"
                class="fa fa-times-circle text-info ListViewColumn-remove m-2"
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
                @click="editDocument(data.item.id)"
                :disabled="!canEdit"
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
          <span>{{ data.item.id }}</span>
        </template>
        <template v-slot:cell()="data">
          <span>{{ data.value }}</span>
        </template>
      </b-table>
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
            tdClass: 'align-middle',
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
          if (key !== 'id') {
            const parsed = this.parseDocument(key, d)
            if (parsed.realValue && Array.isArray(parsed.realValue)) {
              doc[key] = parsed.realValue.toString()
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
      return _.get(doc, customField, '')
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
</style>
