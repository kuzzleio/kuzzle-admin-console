<template>
  <div>
    <ul class="pagination">
      <li @click.prevent="firstPage" :class="{disabled: currentPage == 1}" class="chevron">
        <a href="#">
          <i class="fa fa-angle-double-left fast-pagination waves-effect"></i>
        </a>
      </li>
      <li @click.prevent="previousPage" :class="{disabled: currentPage == 1}" class="chevron">
        <a href="#" class="waves-effect">
          <i class="fa fa-chevron-left"></i>
        </a>
      </li>

      <li v-for="(n, index) in pager"
          :key="index"
          :class="{active: currentPage === n}"
          class="waves-effect" @click.prevent="setCurrentPage(n)">
        <a href="#">{{n}}</a>
      </li>

      <li @click.prevent="nextPage" :class="{disabled: currentPage == pages}" class="chevron">
        <a href="#">
          <i class="fa fa-chevron-right waves-effect"></i>
        </a>
      </li>
      <li
        @click.prevent="lastPage" :class="{disabled: currentPage == pages}" class="chevron">
        <a href="#">
          <i class="fa fa-angle-double-right fast-pagination waves-effect"></i>
        </a>
      </li>
    </ul>
    <p class="pagination-info">{{ from + numberInPage }} / {{ total }}</p>
    <p class="pagination-info" v-if="lastPageLimitation">
      <span class="fa fa-info-circle"></span>
      Due to a limitation, we can't display more than 1000 pages. Please, filter your search.
    </p>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
.pagination,
.pagination-info {
  text-align: center;
  margin-bottom: 5px;

  li {
    font-size: 1rem;

    &.chevron {
      padding-left: 0;
      padding-right: 0;
      margin-right: 2px;
    }
    i {
      font-size: 1rem;

      &.fast-pagination {
        font-size: 1.5rem;
        font-weight: bold;
      }
    }
  }
}
.pagination-info {
  color: #989898;
  font-size: 0.95em;
  margin-top: 2px;
}
</style>

<script>
export default {
  props: {
    total: Number,
    displayPages: {
      type: Number,
      default: 9
    },
    from: Number,
    size: Number,
    maxPage: Number,
    numberInPage: Number
  },
  computed: {
    pages() {
      let totalPage = Math.max(Math.ceil(this.total / this.size), 1)
      return totalPage <= this.maxPage ? totalPage : this.maxPage
    },
    pager() {
      let displayedPages = []
      let maximum = Math.min(this.pages, this.displayPages)
      let start = 1

      if (this.pages > this.displayPages) {
        if (this.currentPage + Math.ceil(this.displayPages / 2) > this.pages) {
          start = this.pages - (this.displayPages - 1)
          maximum = this.pages
        } else if (this.currentPage > Math.ceil(this.displayPages / 2)) {
          start = Math.ceil(this.currentPage - this.displayPages / 2)
          maximum = start + (this.displayPages - 1)
        }
      }

      for (let i = start; i <= maximum; i++) {
        displayedPages.push(i)
      }

      return displayedPages
    },
    currentPage() {
      if (this.from === 0) {
        return 1
      }

      return this.from / this.size + 1
    },
    lastPageLimitation() {
      return this.currentPage === this.maxPage
    }
  },
  methods: {
    setCurrentPage(currentPage) {
      this.$emit('change-page', currentPage * this.size - this.size)
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.$emit(
          'change-page',
          (this.currentPage - 1) * this.size - this.size
        )
      }
    },
    nextPage() {
      if (this.currentPage < this.pages) {
        this.$emit(
          'change-page',
          (this.currentPage + 1) * this.size - this.size
        )
      }
    },
    firstPage() {
      this.setCurrentPage(1)
    },
    lastPage() {
      this.setCurrentPage(this.pages)
    }
  }
}
</script>
