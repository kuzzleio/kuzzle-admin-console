<template>
  <div class="row mr-1 no-gutters mb-2">
    <div class="col relative m-1">
      <button
        class="TimeSeriesColorPickerBtn btn btn-small"
        :style="{ 'background-color': newColor }"
        @click.prevent="togglePicker"
      />
      <color-picker
        v-show="showColorPicker"
        v-model="newColor"
        class="TimeSeriesColorPicker"
        @input="updateColor"
      />
    </div>
    <div class="col mr-1 ml-1">
      <autocomplete
        v-if="!isUpdatable"
        placeholder="Add a value"
        :items="items"
        :value="newValue"
        :notify-change="false"
        @autocomplete::change="attribute => addItem(attribute)"
      />
      <input v-else :value="value" :disabled="true" class="form-control" />
    </div>
    <div class="col-1 ml-1 TimeSeriesColorPickerRemoveContanainer">
      <i
        v-if="isUpdatable"
        class="far fa-times-circle TimeSeriesColorPickerRemoveBtn"
        @click.prevent="$emit('timeseriesitem::remove', index)"
      />
    </div>
  </div>
</template>

<script>
import Autocomplete from '../../../Common/Autocomplete' ;
import { Chrome as ColorPicker } from 'vue-color' ;

const getRandomColor = () => {
  const letters = '0123456789ABCDEF' ;
  let color = '#' ;

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  return color ;
} ;

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
      default: getRandomColor()
    },
    isUpdatable: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => {
        return [] ;
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
  data() {
    return {
      showColorPicker: false,
      newColor: this.color
    } ;
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)

    this.newColor = this.color ;
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.showColorPicker = false ;
      }
    },
    togglePicker() {
      this.showColorPicker = !this.showColorPicker ;
    },
    updateColor(color) {
      this.newColor = color.hex ;
      if (this.isUpdatable) {
        this.$emit('update-color', { color: this.newColor, index: this.index })
      }
    },
    addItem(attr) {
      this.$emit('autocomplete::change', { name: attr, color: this.newColor })
      this.newColor = getRandomColor()
    }
  }
} ;
</script>

<style scoped>
.TimeSeriesView {
  margin-top: 10px;
}
.TimeSeriesColorPickerBtn {
  width: 100%;
  height: 20px;
  margin-top: 5px;
}

.TimeSeriesColorPicker {
  position: absolute;
  z-index: 999;
}

.TimeSeriesColorPickerRemoveContanainer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.TimeSeriesColorPickerRemoveBtn {
  cursor: pointer;
}

.relative {
  position: relative;
}
</style>
