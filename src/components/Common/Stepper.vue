<template>
  <div class="stepper horizontal row">
    <div class="col s10 offset-s4 stepper-content">
      <div class="step-list row">
        <div v-for="(step, index) of steps" class="step col s3" :class="{active: currentStep === index}">
          <div class="left step-content" @click="changeStep(index)">
            <div class="circle">{{index + 1}}</div>
            <p>{{step}}</p>
          </div>
          <div v-if="index < steps.length - 1" class="line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Stepper',
    props: {
      currentStep: {
        type: Number,
        default: 0
      },
      isRealtime: Boolean,
      steps: {
        type: Array,
        required: true
      }
    },
    methods: {
      changeStep (number) {
        if (this.isRealtime) {
          return
        }

        this.$emit('changed-step', number)
      }
    }
  }
</script>

