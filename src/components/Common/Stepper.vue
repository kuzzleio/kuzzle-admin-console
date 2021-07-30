<template>
  <div class="Stepper horizontal row">
    <div class="col s12 Stepper-content">
      <div class="Stepper-list row">
        <div v-for="(step, index) of steps" :key="step">
          <div
            class="Stepper-step col s1"
            :class="{
              disabled: disabledSteps.indexOf(index) != -1,
              'offset-s4': index === 0
            }"
          >
            <div class="left Stepper-stepContent" @click="changeStep(index)">
              <div
                class="Stepper-circle"
                :class="{ active: currentStep === index }"
              >
                {{ index + 1 }}
              </div>
              <p>{{ step }}</p>
            </div>
          </div>
          <div v-if="index < steps.length - 1" class="col s1 line" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// @TODO pass this code to BEM
.Stepper {
  padding: 20px 0 0 0;
}

.Stepper-content {
  min-height: 80px;

  .Stepper-list {
    margin-bottom: 0;
  }
}

.Stepper-circle {
  margin: 0 auto;
  background: #9e9e9e;
  width: 45px;
  height: 45px;
  line-height: 44px;
  border-radius: 23px;
  position: relative;
  color: white;
  text-align: center;
  font-size: 1.2em;

  &.active {
    background-color: $blue-color;
  }
}

.Stepper-step {
  .Stepper-stepContent {
    cursor: pointer;

    p {
      margin-top: 0;
      text-align: center;
    }
  }

  &.disabled {
    opacity: 0.2;

    .Stepper-stepContent {
      cursor: default;
    }
  }
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
        return [] ;
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
        return ;
      }

      this.$emit('changed-step', number)
    }
  }
} ;
</script>
