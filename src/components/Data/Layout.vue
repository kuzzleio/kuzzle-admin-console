<template>

  <aside>
    <ul class="side-nav fixed leftside-navigation ps-container ps-active-y">
      <li>
        <nav>
          <div class="nav-wrapper">
            <form>
              <div class="input-field">
                <input id="search" type="search" required>
                <label for="search"><i class="material-icons">search</i></label>
                <i class="material-icons">close</i>
              </div>
            </form>
          </div>
        </nav>
      </li>
      <li v-link-active class="bold">

      </li>
      <li v-link-active class="bold">

      </li>
    </ul>
  </aside>

  <section>
    <div class="wrapper">
      <router-view></router-view>
    </div>
  </section>

</template>