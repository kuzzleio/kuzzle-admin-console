<template>
  <div class="Error">
    <b-container>
      <b-card>
        <b-card-body>
          <slot>
            An error occurred.
          </slot>
        </b-card-body>
      </b-card>
    </b-container>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
.Error {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
