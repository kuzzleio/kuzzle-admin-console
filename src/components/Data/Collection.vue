<template>
  <nav class="subnav">
    <div class="container">
      <ul>
        <li v-link-active>
          <!-- <a v-link="{name: 'SummaryData', activeClass: 'active'}">Summary</a> -->
        </li>
      </ul>
    </div>
  </nav>
  <section>
    <div class="wrapper">
      <router-view></router-view>
    </div>
  </section>
</template>
