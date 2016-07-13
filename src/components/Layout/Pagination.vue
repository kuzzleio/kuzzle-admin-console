<template>
  <ul class="pagination">
    <li @click.prevent="previousPage" :class="{disabled: currentPage == 0}" class="waves-effect">
      <a v-if="firstLast" @click.prevent="currentPage = 0" href="#"><i class="fa fa-chevron-left"></i></a>
      <a href="#"><i class="fa fa-chevron-left"></i></a>
    </li>

    <li v-for="n in pager"
        :class="{active: currentPage === n}"
        class="waves-effect"
        @click.prevent="setCurrentPage(n)">
      <a @click.prevent href="#">{{n + 1}}</a>
    </li>

    <li @click.prevent="nextPage" :class="{disabled: currentPage == pages - 1}" class="waves-effect">
      <a href="#"><i class="fa fa-chevron-right"></i></a>
      <a v-if="firstLast" @click.prevent="currentPage = pages - 1" href="#"><i class="fa fa-chevron-right"></i></a>
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
      }
    }
  }
</style>

<script>
  let displayPages = 8

  export default {
    props: {
      total: Number,
      limit: Number,
      currentPage: Number
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
        var pageList = []
        let skip = 1

        pageList.push(this.currentPage)

        while (pageList.length < displayPages && pageList.length < this.pages) {
          let page = this.currentPage + skip
          if (page >= 0 && page < this.pages) {
            pageList.push(page)
          }

          skip = skip > 0 ? (skip * -1) : (skip * -1 + 1)
        }

        return pageList.sort(function (n1, n2) { return n1 - n2 })
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
