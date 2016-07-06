<template>
  <header>
    <nav>
      <div class="navbar-fixed">
        <a href="#" class="brand-logo">Logo</a>
        <div class="container">
          <ul>
            <li><a>Dashboard</a></li>
            <li><a>Data</a></li>
            <li v-link-active>
              <a v-link="{name: 'Security', activeClass: 'active'}">Security</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>