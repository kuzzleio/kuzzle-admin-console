<template>
  <b-col cols="12">
    <b-row class="mt-2 ml-0" no-gutters>
      <b-col cols="4">
        <b-select
          class="ml-0"
          v-model="newCustomField"
          :options="formatedSelectFields"
          @change="displayColumn"
        >
          <template v-slot:first>
            <option disabled default :value="null">Add a column</option>
          </template>
        </b-select>

        <!-- <autocomplete
        class="ListViewColumnInput"
        placeholder="Add column"
        :items="mappingArray"
        :value="newCustomField || ''"
        input-class="ListViewColumnInput"
        :notify-change="false"
        @autocomplete::change="
          attribute => {
            newCustomField = attribute
            addCustomField()
          }
        "
      /> -->
      </b-col>
    </b-row>
    <b-row class="mt-2 ml-0 mr-2">
      <b-table
        id="DocumentColumnView-table"
        striped
        sticky-header
        hover
        responsive
        sort-icon-left
        no-border-collapse
        small
        :fields="formatedTableFields"
        :items="formatedItems"
        :tbody-transition-props="{ name: 'flip-list' }"
      >
        <template v-slot:head()="data">
          <span class="text-info m-3"
            >{{ data.label }}
            <i
              v-if="data.field.deletable"
              class="fa fa-times-circle ListViewColumn-remove"
              @click="hideColumn(data.field.index)"
            />
          </span>
        </template>
        <template v-slot:cell(id)="data">
          <b-row class="pl-2">
            <b-dropdown
              data-cy="DocumentListItem-dropdown"
              :id="data.item.id"
              toggle-class="text-decoration-none"
              no-caret
              variant="link"
              size="sm"
            >
              <template v-slot:button-content>
                <i class="fas fa-ellipsis-v" />
              </template>
              <b-dropdown-item
                :disabled="!canEdit"
                :class="{ disabled: !canEdit }"
                @click="editDocument(data.item.id)"
              >
                Edit
              </b-dropdown-item>
              <b-dropdown-item
                :disabled="!canDelete"
                :class="{ disabled: !canDelete }"
                @click="deleteDocument(data.item.id)"
              >
                Delete
              </b-dropdown-item>
            </b-dropdown>
            <b-form-checkbox
              :checked="isChecked(data.item.id)"
              @change="toggleSelectDocument(data.item.id)"
            >
            </b-form-checkbox>
            {{ data.item.id }}
          </b-row>
        </template>
        <template v-slot:cell()="data">
          <span class="m-3">{{ data.value }}</span>
        </template>
      </b-table>
    </b-row>
    <!-- <table class="centered highlight striped">
      <thead>
        <tr>
          <th class="actions" />
          <th>id</th>
          <th
            v-for="(attr, k) in customFields"
            :key="k"
            class="Column-view-title"
          >
            {{ attr
            }}<i
              class="fa fa-times-circle ListViewColumn-remove"
              @click="removeColumn(k)"
            />
          </th>
          <th v-if="mappingArray.length">
            <form>
              <div class="row">
                <div class="col s12">
                  <autocomplete
                    class="ListViewColumnInput"
                    placeholder="Add column"
                    :items="mappingArray"
                    :value="newCustomField || ''"
                    input-class="ListViewColumnInput"
                    :notify-change="false"
                    @autocomplete::change="
                      attribute => {
                        newCustomField = attribute
                        addCustomField()
                      }
                    "
                  />
                </div>
              </div>
            </form>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(doc, kk) in documents" :key="kk">
          <td class="actions">
            <dropdown
              :id="`document-dropdown-${doc.id}`"
              class="DocumentBoxItem-actions"
            >
              <li>
                <a
                  v-title="{
                    active: !canDelete,
                    title: 'You are not allowed to edit this document'
                  }"
                  :class="{ disabled: !canEdit }"
                  @click="editDocument(doc.id)"
                >
                  Edit
                </a>
              </li>
              <li class="divider" />
              <li>
                <a
                  v-title="{
                    active: !canDelete,
                    title: 'You are not allowed to delete this document'
                  }"
                  :class="{ disabled: !canDelete }"
                  @click="deleteDocument(doc.id)"
                >
                  Delete
                </a>
              </li>
            </dropdown>
          </td>
          <td class="DocumentColumnItem">
            {{ doc.id }}
          </td>
          <td
            v-for="(attr, k) in customFields"
            :key="k"
            class="DocumentColumnItem"
          >
            <span v-if="parseDocument(attr, doc).isObject" class="relative">
              <a
                href="#"
                @click.prevent="toggleJsonFormatter(attr + doc.id)"
                @blur="onBlur(attr + doc.id)"
                >{{ parseDocument(attr, doc).value }} ...</a
              >
              <pre
                tabindex="1"
                :ref="attr + doc.id"
                v-json-formatter="{
                  content: parseDocument(attr, doc).realValue,
                  open: true
                }"
                class="DocumentListViewColumn-jsonFormatter"
                style="visibility: hidden;"
              />
            </span>
            <span v-else>
              {{ parseDocument(attr, doc).value }}
            </span>
          </td>
        </tr>
      </tbody>
    </table> -->
  </b-col>
</template>

<script>
// import Dropdown from '../../../Materialize/Dropdown'
import Title from '../../../../directives/title.directive'
import JsonFormatter from '../../../../directives/json-formatter.directive'
import {
  canEditDocument,
  canDeleteDocument
} from '../../../../services/userAuthorization'
// import Autocomplete from '../../../Common/Autocomplete'
import _ from 'lodash'

export default {
  name: 'Column',
  directives: {
    Title,
    JsonFormatter
  },
  components: {
    // Dropdown,
    // Autocomplete
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
      customFields: [],
      newCustomField: null,
      mappingArray: [],
      defaultFields: [
        {
          key: 'id',
          displayed: true,
          deletable: false,
          sortable: true
        }
      ]
    }
  },
  computed: {
    formatedSelectFields() {
      return this.mappingArray
        .map((attr, index) => ({
          value: index,
          text: attr.key,
          displayed: attr.displayed
        }))
        .filter(attr => !attr.displayed)
    },
    formatedTableFields() {
      return this.defaultFields.concat(
        this.mappingArray
          .map((attr, index) => ({
            key: attr.key,
            index: index,
            sortable: true,
            displayed: attr.displayed,
            deletable: true
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
      // const columnsConfig = JSON.parse(
      //   localStorage.getItem('columnViewConfig') || '{}'
      // )

      // this.customFields = []
      // if (
      //   columnsConfig[this.index] &&
      //   columnsConfig[this.index][this.collection]
      // ) {
      //   this.customFields = columnsConfig[this.index][this.collection]
      // } else {
      //   this.customFields = []
      // }
    },
    mapping() {
      this.initColumnsFields()
      // this.mappingArray = this.buildAttributeList(this.mapping)
      // for (const attr of this.customFields) {
      //   this.mappingArray.splice(this.mappingArray.indexOf(attr), 1)
      // }
    }
  },
  mounted() {
    this.initColumnsFields()
  },
  methods: {
    toggleSelectDocument(id) {
      this.$emit('checkbox-click', id)
    },
    initColumnsFields() {
      this.mappingArray = this.buildAttributeList(this.mapping)
      const columnsConfig = {}
      // = JSON.parse(
      // localStorage.getItem('columnViewConfig') || '{}'
      // )
      if (
        columnsConfig[this.index] &&
        columnsConfig[this.index][this.collection]
      ) {
        // this.customFields = columnsConfig[this.index][this.collection]
        this.mappingArray = this.mappingArray.map(attr => {
          attr.displayed = columnsConfig[this.index][this.collection].includes(
            attr.key
          )
          return attr
        })
      }
      // for (const attr of this.customFields) {
      // this.mappingArray.splice(this.mappingArray.indexOf(attr), 1)
      // }
      // const found = this.customFields.findIndex(attr => attr === 'id')
      // if (found === -1) {
      //   this.customFields.unshift('id')
      // }
    },
    displayColumn(index) {
      this.mappingArray[index].displayed = true
      this.newCustomField = null
    },
    hideColumn(index) {
      this.mappingArray[index].displayed = false
      this.newCustomField = null
    },
    // onBlur(id) {
    //   this.$refs[id][0].style.visibility = 'hidden'
    // },
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
        config[this.index][this.collection] = this.customFields
        localStorage.setItem('columnViewConfig', JSON.stringify(config))
      }
    },
    // removeColumn(col) {
    //   console.log(this.customFields)

    //   this.mappingArray.push(this.customFields[col])
    //   this.mappingArray.sort()
    //   this.customFields.splice(col, 1)
    //   this.saveToLocalStorage()
    //   console.log(this.customFields)
    // },
    getNestedField(doc, customField) {
      return _.get(doc, customField, '')
    },
    // addCustomField() {
    //   if (this.newCustomField) {
    //     this.customFields.push(this.newCustomField)
    //     this.mappingArray.splice(
    //       this.mappingArray.indexOf(this.newCustomField),
    //       1
    //     )
    //     this.newCustomField = null
    //     this.saveToLocalStorage()
    //   }
    //   console.log(this.customFields)
    // },
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
          // attributes = attributes.concat({
          //   key: path.concat(attributeName).join('.'),
          //   displayed: false
          // })
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
table#DocumentColumnView-table .flip-list {
  transition: transform 1s;
}
// .DocumentColumnItem {
//   padding: 0px 0px;
//   white-space: pre;
//   word-wrap: break-word;
//   font-size: 0.9rem;
// }

// td {
//   padding: 0 0 0 0;
// }

// .ListViewColumnInput {
//   width: 300px;
//   float: left;
// }

// .ListViewColumn-remove {
//   color: #3498db;
//   cursor: pointer;
//   padding-left: 6px;
// }

// .DocumentListViewColumn-add {
//   float: left;
//   color: #3498db;
//   font-size: 1.4rem;
//   padding-top: 10px;
//   cursor: pointer;
// }

// .actions {
//   width: 20px;
// }

// .relative {
//   position: relative;
// }

// .DocumentListViewColumn-jsonFormatter {
//   position: absolute;
//   background-color: #fff;
//   border: 0.3px solid grey;
//   z-index: 999;
//   left: 0;
//   bottom: 0;
//   padding: 5px;
//   text-align: left;
// }

// .Column-view-title {
//   white-space: nowrap;
// }
//
</style>

<style>
.Autocomplete-results {
  height: 200px !important;
}
</style>
