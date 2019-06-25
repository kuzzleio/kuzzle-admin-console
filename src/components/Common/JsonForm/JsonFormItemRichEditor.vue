<template>
  <div class="row input-field">
    <div class="row">
      <p>{{ name }}</p>
      <quill-editor
        ref="richText"
        v-model="value"
        :config="config"
      />
    </div>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'

export default {
  name: 'JsonFormItemRichEditor',
  components: {
    quillEditor
  },
  props: {
    content: Object,
    name: String,
    type: String,
    step: Number,
    parent: String
  },
  data() {
    return {
      value: '',
      config: {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            ['clean'],
            ['image']
          ]
        }
      }
    }
  },
  watch: {
    content: 'initValue',
    value() {
      this.$emit('update-value', { name: this.name, value: this.value })
    }
  },
  mounted() {
    this.initValue()
  },
  methods: {
    initValue() {
      if (this.parent) {
        this.value = this.content[this.parent][this.name]
      } else {
        this.value = this.content[this.name]
      }
    }
  }
}
</script>
