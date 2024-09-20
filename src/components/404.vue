<template>
  <div class="Main">
    <div class="fourOhFourPage">
      <b-container fluid class="h-100">
        <b-row class="justify-content-center h-100" align-v="center">
          <b-col cols="6">
            <b-card title="404 not found">
              <b-card-text>
                <p>There is nothing here...</p>
              </b-card-text>
              <b-button :to="{ name: 'Data' }" class="404BackToHome-link" variant="primary"
                >Go back to the main page</b-button
              >
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
};
</script>

<style scoped>
.fourOhFourPage {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
