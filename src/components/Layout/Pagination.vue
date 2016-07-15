<template>
  <ul class="pagination">
    <li @click.prevent="previousPage" :class="{disabled: currentPage == 0}" class="waves-effect">
      <a @click.prevent="currentPage = 0" href="#"><i class="fa fa-angle-double-left fast-pagination"></i></a>
      <a href="#"><i class="fa fa-chevron-left"></i></a>
    </li>

    <li v-for="n in pager"
        :class="{active: currentPage === n}"
        class="waves-effect">
      <a @click.prevent="setCurrentPage(n)" href="#">{{n + 1}}</a>
    </li>

    <li @click.prevent="nextPage" :class="{disabled: currentPage == pages - 1}" class="waves-effect">
      <a href="#"><i class="fa fa-chevron-right"></i></a>
      <a @click.prevent="currentPage = pages - 1" href="#"><i class="fa fa-angle-double-right fast-pagination"></i></a>
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
        'default': 8
      }
    },
    watch: {
      currentPage () {
        if (this.currentPage >= this.pages - 1) {
          this.currentPage = this.pages - 1
          this.$dispatch('change-page', this.currentPage)
        }
      }
    },
    computed: {
      pages () {
        return Math.max(Math.ceil(this.total / this.limit), 1)
      },
      pager () {

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
      },
      getSelected () {
        return {
          currentPage: this.currentPage,
          pageSize: this.limit,
          from: this.currentPage * this.limit,
          to: (this.currentPage + 1) * this.limit,
          size: this.limit
        }
      }
    }
  }
</script>
