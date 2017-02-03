<template>
  <div class="stepper horizontal row">
    <div class="col s10 offset-s4">
      <div class="step" :class="{active: currentStep === 1}">
        <div class="col s1">
            <div class="circle">1</div>
            <p>Mapping</p>
        </div>
        <div class="line col s2"></div>
      </div>

      <div class="step" :class="{active: currentStep === 2}">
        <div class="step col s1">
          <div class="circle">2</div>
          <p>Form</p>
        </div>
        <!--<div class="line col s2"></div>-->
      </div>

      <!--<div class="step" :class="{active: currentStep === 3}">-->
        <!--<div class="step col s1">-->
          <!--<div class="circle">3</div>-->
          <!--<p>Validation</p>-->
        <!--</div>-->
        <!--<div class="line col s2"></div>-->
      <!--</div>-->

      <!--<div class="step" :class="{active: currentStep === 4}">-->
        <!--<div class="step col s1">-->
          <!--<div class="circle">4</div>-->
          <!--<p>Preview</p>-->
        <!--</div>-->
      <!--</div>-->
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Stepper',
    props: {
      currentStep: Number
    },
    method: {
      changeStep (number) {
        this.$emit('change-step-collection', number)
      }
    }
  }
</script>

