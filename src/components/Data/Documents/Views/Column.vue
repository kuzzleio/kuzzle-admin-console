<template>
  <table class="centered highlight striped">
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
  </table>
</template>

<script>
import Dropdown from '../../../Materialize/Dropdown'
import Title from '../../../../directives/title.directive'
import JsonFormatter from '../../../../directives/json-formatter.directive'
import {
  canEditDocument,
  canDeleteDocument
} from '../../../../services/userAuthorization'
import Autocomplete from '../../../Common/Autocomplete'
import _ from 'lodash'

export default {
  name: 'Column',
  directives: {
    Title,
    JsonFormatter
  },
  components: {
    Dropdown,
    Autocomplete
  },
  props: {
    documents: Array,
    index: String,
    collection: String,
    value: [Object, String, Array],
    mapping: Object
  },
  data() {
    return {
      customFields: [],
      newCustomField: null,
      mappingArray: []
    }
  },
  computed: {
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
      const columnsConfig = JSON.parse(
        localStorage.getItem('columnViewConfig') || '{}'
      )

      this.customFields = []
      if (
        columnsConfig[this.index] &&
        columnsConfig[this.index][this.collection]
      ) {
        this.customFields = columnsConfig[this.index][this.collection]
      } else {
        this.customFields = []
      }
    },
    mapping() {
      this.mappingArray = this.buildAttributeList(this.mapping)
      for (const attr of this.customFields) {
        this.mappingArray.splice(this.mappingArray.indexOf(attr), 1)
      }
    }
  },
  mounted() {
    const columnsConfig = JSON.parse(
      localStorage.getItem('columnViewConfig') || '{}'
    )

    if (
      columnsConfig[this.index] &&
      columnsConfig[this.index][this.collection]
    ) {
      this.customFields = columnsConfig[this.index][this.collection]
    }

    this.mappingArray = this.buildAttributeList(this.mapping)
    for (const attr of this.customFields) {
      this.mappingArray.splice(this.mappingArray.indexOf(attr), 1)
    }
  },
  methods: {
    onBlur(id) {
      this.$refs[id][0].style.visibility = 'hidden'
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
        config[this.index][this.collection] = this.customFields
        localStorage.setItem('columnViewConfig', JSON.stringify(config))
      }
    },
    removeColumn(col) {
      this.mappingArray.push(this.customFields[col])
      this.mappingArray.sort()
      this.customFields.splice(col, 1)
      this.saveToLocalStorage()
    },
    getNestedField(doc, customField) {
      return _.get(doc, customField, '')
    },
    addCustomField() {
      if (this.newCustomField) {
        this.customFields.push(this.newCustomField)
        this.mappingArray.splice(
          this.mappingArray.indexOf(this.newCustomField),
          1
        )
        this.newCustomField = null
        this.saveToLocalStorage()
      }
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
        if (attributeValue.hasOwnProperty('properties')) {
          attributes = attributes.concat(path.concat(attributeName).join('.'))
          attributes = attributes.concat(
            this.buildAttributeList(
              attributeValue.properties,
              path.concat(attributeName)
            )
          )
        } else if (attributeValue.hasOwnProperty('type')) {
          attributes = attributes.concat(path.concat(attributeName).join('.'))
        }
      }

      return attributes
    }
  }
}
</script>

<style lang="scss" scoped>
.DocumentColumnItem {
  padding: 0px 0px;
  white-space: pre;
  word-wrap: break-word;
  font-size: 0.9rem;
}

td {
  padding: 0 0 0 0;
}

.ListViewColumnInput {
  width: 300px;
  float: left;
}

.ListViewColumn-remove {
  color: #3498db;
  cursor: pointer;
  padding-left: 6px;
}

.DocumentListViewColumn-add {
  float: left;
  color: #3498db;
  font-size: 1.4rem;
  padding-top: 10px;
  cursor: pointer;
}

.actions {
  width: 20px;
}

.relative {
  position: relative;
}

.DocumentListViewColumn-jsonFormatter {
  position: absolute;
  background-color: #fff;
  border: 0.3px solid grey;
  z-index: 999;
  left: 0;
  bottom: 0;
  padding: 5px;
  text-align: left;
}

.Column-view-title {
  white-space: nowrap;
}
</style>

<style>
.Autocomplete-results {
  height: 200px !important;
}
</style>
