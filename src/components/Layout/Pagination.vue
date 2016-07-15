<template>
  <ul class="pagination">
    <li @click.prevent="previousPage" :class="{disabled: currentPage == 1}">
      <a @click.prevent="currentPage = 1" href="#"><i class="fa fa-angle-double-left fast-pagination waves-effect"></i></a>
      <a href="#" class="waves-effect"><i class="fa fa-chevron-left"></i></a>
    </li>

    <li v-for="n in pager"
        :class="{active: currentPage === n}"
        class="waves-effect" @click.prevent="setCurrentPage(n)">
      <a href="#">{{n}}</a>
    </li>

    <li @click.prevent="nextPage" :class="{disabled: currentPage == pages}">
      <a href="#"><i class="fa fa-chevron-right waves-effect"></i></a>
      <a @click.prevent="currentPage = pages" href="#" class="waves-effect"><i class="fa fa-angle-double-right fast-pagination"></i></a>
    </li>
  </ul>
</template>

<style lang="scss" rel="stylesheet/scss">
  .pagination {
    text-align: center;

    li {
      font-size: 1rem;

      i {
        font-size: 1rem;

        &.fast-pagination {
          font-size: 1.5rem;
          font-weight: bold;
        }
      }
    }
  }
</style>

<script>
  export default {
    props: {
      total: Number,
      limit: {
        type: Number,
        'default': 10
      },
      currentPage: Number,
      displayPages: {
        type: Number,
        'default': 9
      }
    },
    watch: {
      currentPage () {
        if (this.currentPage > this.pages) {
          this.currentPage = this.pages
          this.$dispatch('change-page', this.currentPage)
        }
      }
    },
    computed: {
      pages () {
        return Math.max(Math.ceil(this.total / this.limit), 1)
      },
      pager () {
        let displayedPages = []
        let maximum = this.pages < this.displayPages ? this.pages : this.displayPages
        let start = 1

        if (this.pages <= this.displayPages) {
          start = 1
          maximum = this.pages
        } else if (this.currentPage + Math.ceil(this.displayPages / 2) > this.pages) {
          start = this.pages - (this.displayPages - 1)
          maximum = this.pages
        } else if (this.currentPage > Math.ceil(this.displayPages / 2)) {
          start = Math.ceil(this.currentPage - (this.displayPages / 2))
          maximum = start + (this.displayPages - 1)
        }

        for (let i = start; i <= maximum; i++) {
          displayedPages.push(i)
        }

        return displayedPages
      }
    },
    methods: {
      setCurrentPage (n) {
        this.currentPage = n
        this.$dispatch('change-page', this.currentPage)
      },
      previousPage () {
        if (this.currentPage > 0) {
          this.currentPage--
          this.$dispatch('change-page', this.currentPage)
        }
      },
      nextPage () {
        if (this.currentPage < this.pages - 1) {
          this.currentPage++
          this.$dispatch('change-page', this.currentPage)
        }
      }
    }
  }
</script>
