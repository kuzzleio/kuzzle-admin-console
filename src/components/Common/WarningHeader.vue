<template>
  <div class="WarningHeader">
    <span v-html="text" />    
  </div>
</template>

<script>
  export default {
    name: 'WarningHeader',
    props: {
      text: {
        type: String,
        required: true
      }
    }
  }
</script>

<style lang="scss">
.WarningHeader {
  line-height: 2.5em;
  background-color: $blue-color;
  color: #fff;
  text-align: center;

  a {
    color: #fff;
    text-decoration: underline;
  }
}
</style>
