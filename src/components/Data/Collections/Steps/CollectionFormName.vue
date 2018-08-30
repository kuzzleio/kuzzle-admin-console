<template>
  <div class="CollectionFormName row">
    <div class="col s3">
      <p>
        Document name:
        <i
          class="fa fa-question-circle info"
          v-title="{active: true, position: 'bottom', title: 'Choose the attribute value displayed in documents list.'}">
        </i>
      </p>
    </div>
    <div class="col s4 list-names">
      <m-select :value="selectedDocumentName" >
        <option v-for="(_, option) in attributes" :value="option" :key="option">{{option}}</option>
      </m-select>
    </div>
  </div>
</template>

<script>
import MSelect from '../../../Common/MSelect'
import title from '../../../../directives/title.directive'

export default {
  name: 'CollectionFormName',
  components: {
    MSelect
  },
  directives: {
    title
  },
  props: {
    attributes: Object,
    selectedDocumentName: String
  }
}
</script>

<style lang="scss" scoped>
.CollectionFormName {
  .list-names {
    margin-top: 15px;
  }
}
</style>
