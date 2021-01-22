<template>
  <b-alert :show="show" variant="info">
    <b-row>
      <b-col class="text-left">
        Here, you'll be able to perform custom
        <a
          href="https://docs.kuzzle.io/sdk/js/7/core-classes/kuzzle/query/"
          target="_blank"
          >query
          <i class="fa fa-external-link-alt" />
        </a>
        to Kuzzle following the
        <a
          href="https://docs.kuzzle.io/core/2/api/payloads/request/"
          target="_blank"
          >API Documentation
          <i class="fa fa-external-link-alt" />
        </a>
        .
      </b-col>
      <b-col class="text-right">
        <i class="fas fa-times" @click="closeAlert" />
      </b-col>
    </b-row>
  </b-alert>
</template>

<script>
export default {
  data() {
    return {
      show: true
    }
  },
  methods: {
    closeAlert() {
      this.show = false
      this.$emit('closeAlert')
    }
  }
}
</script>

<style></style>
