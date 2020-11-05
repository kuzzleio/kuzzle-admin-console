<template>
  <json-editor
    class="w-100"
    :content="JSON.stringify(value, null, 2) || '{}'"
    @change="onChange"
  />
</template>

<script>
import { abstractField } from 'vue-form-generator'
import JsonEditor from '@/components/Common/JsonEditor'

export default {
  components: {
    JsonEditor
  },
  mixins: [abstractField],
  methods: {
    onChange(jsonString) {
      try {
        this.value = JSON.parse(jsonString)
      } catch (err) {
        // do nothing...
        // if the JSON is invalid, no need to trigger form change event
        return
      }
    }
  }
}
</script>
