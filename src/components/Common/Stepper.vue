<template>
  <div class="stepper horizontal row">
    <div class="col s12 stepper-content">
      <div class="step-list row">
        <div v-for="(step, index) of steps">
          <div class="step col s1" :class="{active: currentStep === index, disabled: disabledSteps.indexOf(index) != -1, 'offset-s4': index === 0 }">
            <div class="left step-content" @click="changeStep(index)">
              <div class="circle">{{index + 1}}</div>
              <p>{{step}}</p>
            </div>
          </div>
          <div v-if="index < steps.length - 1" class="col s1 line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style type="text/css" scoped>
.circle {
  margin: 0 auto;
}
.line {
  border-top: 1px solid gainsboro;
  margin-top: 25px;
}
</style>

<script>
export default {
  name: 'Stepper',
  props: {
    currentStep: {
      type: Number,
      default: 0
    },
    disabledSteps: {
      type: Array,
      default: () => {
        return []
      }
    },
    steps: {
      type: Array,
      required: true
    }
  },
  methods: {
    changeStep(number) {
      if (this.disabledSteps.indexOf(number) !== -1) {
        return
      }

      this.$emit('changed-step', number)
    }
  }
}
</script>
