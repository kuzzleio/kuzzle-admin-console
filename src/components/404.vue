<template>
  <div class="fourOhFourPage">
    <b-container fluid class="h-100">
      <b-row class="justify-content-center h-100" align-v="center">
        <b-col cols="6">
          <b-card title="404 not found">
            <b-card-text>
              <p>The index or collection that you requested doesn't exist.</p>
              <p>
                If you have a lot of indexes and/or collections please wait
                until those are loaded in the left menu and this 404 will
                desappear.
              </p>
            </b-card-text>
            <b-button
              :to="{ name: 'Data' }"
              class="404BackToHome-link"
              variant="primary"
              >Go back to the main page</b-button
            >
          </b-card>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          nique
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.fourOhFourPage {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
