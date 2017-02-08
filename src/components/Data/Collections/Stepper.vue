<template>
  <div class="stepper horizontal row">
    <div class="col s10 offset-s4">
      <div class="step-list row">
        <div class="step col s3 step-content" :class="{active: currentStep === 1}">
          <div class="left step-content" @click="changeStep(1)">
            <div class="circle">1</div>
            <p>Mapping</p>
          </div>
          <div class="line"></div>
        </div>

        <div class="step col s3 step-content" :class="{active: currentStep === 2}">
          <div class="left step-content" @click="changeStep(2)">
            <div class="circle">2</div>
            <p>Form</p>
          </div>
          <!--<div class="line"></div>-->
        </div>

        <!--<div class="step col s3 step-content" :class="{active: currentStep === 3}">-->
          <!--<div class="left step-content" @click="changeStep(2)">-->
            <!--<div class="circle">2</div>-->
            <!--<p>Validation</p>-->
          <!--</div>-->
          <!--<div class="line"></div>-->
        <!--</div>-->

        <!--<div class="step col s3 step-content" :class="{active: currentStep === 4}">-->
          <!--<div class="left step-content" @click="changeStep(2)">-->
            <!--<div class="circle">2</div>-->
            <!--<p>Preview</p>-->
          <!--</div>-->
        <!--</div>-->
      </div>
    </div>
  </div>
</template>

<script>
  import {SET_EDITION_STEP} from '../../../vuex/modules/collection/mutation-types'
  export default {
    name: 'Stepper',
    props: {
      currentStep: Number
    },
    methods: {
      changeStep (number) {
        this.$store.commit(SET_EDITION_STEP, number)
      }
    }
  }
</script>

