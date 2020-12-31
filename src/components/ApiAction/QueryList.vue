<template>
  <b-row class="h-100 text-center mx-0" align-v="center" align-h="center">
    <b-col cols="12" class="h-100 px-0">
      <b-card class="h-100 backgroundCard" no-body>
        <b-card-body class="d-flex flex-column text-center m-0 p-0">
          <b-card-text class="px-1">
            <b-list-group>
              <b-list-group-item
                v-for="query of paginedQueries"
                class="d-flex justify-content-between align-items-center"
                :key="`saved-query-${query.idx}`"
                :active="query.idx === currentQueryIndex"
              >
                <span @click="loadSavedQuery(query.idx)">{{ query.name }}</span>
                <i
                  :class="`fas fa-trash`"
                  @click="deleteSavedQuery(query.idx)"
                />
              </b-list-group-item>
            </b-list-group>
          </b-card-text>
          <b-row class="mt-auto mx-0" align-h="center">
            <b-pagination
              v-model="currentPage"
              :total-rows="savedQueries.length"
              :per-page="queryPerPage"
              aria-controls="my-table"
            ></b-pagination>
          </b-row>
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  props: {
    currentQueryName: {

    },
    savedQueries: {

    }
  },
  data() {
    return {
      queryPerPage: 10,
      currentPage: 1
    }
  },
  computed: {
    currentQueryIndex() {
      return this.savedQueries.findIndex(q => q.name === this.currentQueryName)
    },
    paginedQueries() {
      return this.savedQueries
        .map((q, index) => {
          q.idx = index
          return q
        })
        .filter(q => {
          return (
            q.idx >= this.currentPage * this.queryPerPage - this.queryPerPage &&
            q.idx < this.currentPage * this.queryPerPage
          )
        })
    }
  },
  methods: {
    deleteSavedQuery(index) {
      this.$emit("deleteSavedQuery", index)
    },
    loadSavedQuery(index) {
      this.$emit("loadSavedQuery", index)
    }
  }
}
</script>

<style></style>
