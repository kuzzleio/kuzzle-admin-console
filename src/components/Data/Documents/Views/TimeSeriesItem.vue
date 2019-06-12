<template>
  <div
    class="row bordered"
  >         
    <div 
      class="col s12 relative"
    >
      <i
        v-if="isUpdatable"
        class="far fa-times-circle TimeSeriesColorPickerRemoveBtn"
        @click.prevent="$emit('timeseriesitem::remove', index)"
      />
      <button 
        class="TimeSeriesColorPickerBtn btn btn-small"
        :style="{'background-color': newColor}"
        @click.prevent="togglePicker"
      />
      <color-picker
        v-show="showColorPicker" 
        v-model="newColor"
        class="TimeSeriesColorPicker"
        @input="updateColor"
      />
    </div>
    <div class="col s12">
      <autocomplete
        v-if="!isUpdatable"
        placeholder="Add a value"
        :items="items"
        :value="newValue"
        :notify-change="false"
        @autocomplete::change="attribute => { $emit('autocomplete::change', { name: attribute, color: newColor }) }"
      />
      <input
        v-else
        :value="value"
        :disabled="true"
      >
    </div>
  </div>
</template>

<script>
import Autocomplete from '../../../Common/Autocomplete'
import { Chrome as ColorPicker } from 'vue-color'

export default {
  name: 'TimeSeriesItem',
  components: {
    Autocomplete,
    ColorPicker
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#1D90E0'
    },
    isUpdatable: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => {
        return []
      }
    },
    newValue: {
      type: String,
      default: ''
    },
    index: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      showColorPicker: false,
      newColor: '#1D90E0'
    }
  },
  mounted () {
    document.addEventListener('click', this.handleClickOutside)
  
    this.newColor = this.color
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.showColorPicker = false
      }
    },
    togglePicker () {
      this.showColorPicker = !this.showColorPicker
    },
    updateColor (color) {
      this.newColor = color.hex
      if (this.isUpdatable) {
        this.$emit('update-color', { color: this.newColor, index: this.index })
      }
    }
  }
}
</script>

<style scoped>
.TimeSeriesView {
  margin-top: 10px;
}
.TimeSeriesColorPickerBtn {
  width: 90%;
  height: 20px;
  margin-top: 10px;
}
.bordered {
  border: .5px solid grey;
}
.TimeSeriesColorPicker {
  position: absolute;
  z-index: 999;
}
.TimeSeriesColorPickerRemoveBtn {
  position: absolute;
  right: 5px;
  top: 5px;
  cursor: pointer;
}

.relative {
  position: relative;
}
</style>
