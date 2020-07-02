<template>
  <v-jsoneditor
    v-model="json"
    data-cy="JSONEditor"
    ref="jsoneditor"
    :id="id"
    :options="options"
    :plus="true"
    :height="editorHeight"
  />
</template>

<style lang="scss" rel="stylesheet/scss">
.max-btn {
  display: block;
  right: 5px;
}

.jsoneditor {
  border-color: $primary-color;
}

.jsoneditor-menu {
  background-color: $primary-color !important;
}
.jsoneditor-poweredBy {
  display: none;
}

.jsoneditor-sort {
  display: none;
}

.jsoneditor-transform {
  display: none;
}

.ace_text-input {
  position: relative;
}
</style>

<script>
export default {
  name: 'JsonEditor',
  props: {
    content: String,
    readonly: Boolean,
    id: String,
    height: { type: Number, default: 400 },
    refreshAce: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      json: {},
      options: {
        mode: 'code'
      }
    }
  },
  computed: {
    editorHeight() {
      if (this.height === undefined) {
        return '400px'
      } else {
        return this.height + 'px'
      }
    }
  },
  methods: {
    getRawValue() {
      return JSON.stringify(this.json)
    },
    setContent(value) {
      this.json = JSON.parse(value)
    }
  },
  watch: {
    json: {
      handler() {
        this.$emit('change', this.getRawValue())
      }
    }
  },
  mounted() {
    this.json = JSON.parse(this.content)
  }
}
</script>
