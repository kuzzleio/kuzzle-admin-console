<template>
  <div class="fourOhFourPage h-100">
    <b-container class="h-100">
      <b-card bg-variant="light">
        <b-card-text class="text-center text-secondary">
          <i class="fas fa-question fa-6x mb-3" />
          <h2 class="font-weight-bold">404 not found</h2>
          <p>The index or collection that you requested doesn't exist.</p>
          <b-button :to="{ name: 'Data' }" class="404BackToHome-link mt-3" variant="primary"
            >Go back to the main page</b-button
          >
        </b-card-text>
      </b-card>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
};
</script>

<style scoped>
.fourOhFourPage {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
