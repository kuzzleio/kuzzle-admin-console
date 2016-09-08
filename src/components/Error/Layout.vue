<template>
  <div class="container-error">
    <div class="container">
      <div class="row">
        <div class="col card wrapper s6 offset-s3">
          <div class="col s12">
            <h1 class="center-align logo">
              <img src="../../assets/logo.png" alt="Kuzzle Backoffice" style="width: 70%"/>
            </h1>
          </div>
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .container-error {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    padding-top: 50px;
    height: 100%;

    .logo {
      margin-top: 40px;
      margin-bottom: 25px;
    }
  }
</style>