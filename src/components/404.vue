<template>
  <div class="wrapper">
    <div class="row center">
      <h1>404 not found</h1>
      <p>The index or collection that you requested doesn't exist.</p>
      <p>If you have a lot of indexes and/or collections please wait until those are loaded in the left menu and this 404 will desappear.</p>
      <router-link
        class="404BackToHome-link"
        :to="{name: 'Data'}"
      >
        Go back to the main page
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>
