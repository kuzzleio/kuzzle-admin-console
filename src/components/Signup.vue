<template>
  <div class="container">
    <div class="col m6">
      <h2 class="center-align">
        <img src="../assets/logo.png" alt="Welcome to the Kuzzle Backoffice" />
      </h2>
      <div class="row">
        <div class="col s6 offset-s3">
          <div class="card-panel teal">
          <span class="white-text ">
            You're about to create your first admin!
          </span>
          </div>
        </div>
      </div>
      <div class="row">
        <form class="col s6 offset-s3" id="loginForm" method="post" @submit.prevent="doLogin(username, password)">
          <div class="row">
            <div class="input-field col s12">
              <input id="username" v-model="username" type="text" name="username" required
                     class="validate"/>
              <label for="username">Username</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s12">
              <input v-model="password1" type="password" name="password1" id="pass1" required
                     class="validate"/>
              <label for="pass1">Password</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s12">
              <input v-model="password2" type="password" name="password2" id="pass2" required
                     class="validate"/>
              <label for="pass2">Password (confirmation)</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s12">
              <input v-model="reset" type="checkbox" class="filled-in" id="filled-in-box" />
              <label for="filled-in-box">Reset default anonymous rights?</label>
            </div>
          </div>
          <div class="row">
            <div class="col m6">
              <p class="error">{{error}}</p>
            </div>
            <div class="col m6">
              <p class="right-align">
                <button class="btn waves-effect waves-light" type="submit" name="action">Create my first admin</button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>