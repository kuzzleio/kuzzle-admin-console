<template>
  <div>
    <ul class="pagination">
      <li :class="{ disabled: currentPage === 1 }" class="chevron" @click.prevent="firstPage">
        <a href="#">
          <i class="fa fa-angle-double-left fast-pagination waves-effect" />
        </a>
      </li>
      <li :class="{ disabled: currentPage === 1 }" class="chevron" @click.prevent="previousPage">
        <a href="#" class="waves-effect">
          <i class="fa fa-chevron-left" />
        </a>
      </li>

      <li
        v-for="(n, index) in pager"
        :key="index"
        :class="{ active: currentPage === n }"
        class="waves-effect"
        @click.prevent="setCurrentPage(n)"
      >
        <a href="#">{{ n }}</a>
      </li>

      <li :class="{ disabled: currentPage === pages }" class="chevron" @click.prevent="nextPage">
        <a href="#">
          <i class="fa fa-chevron-right waves-effect" />
        </a>
      </li>
      <li :class="{ disabled: currentPage === pages }" class="chevron" @click.prevent="lastPage">
        <a href="#">
          <i class="fa fa-angle-double-right fast-pagination waves-effect" />
        </a>
      </li>
    </ul>
    <p class="pagination-info">{{ from + numberInPage }} / {{ total }}</p>
    <p v-if="lastPageLimitation" class="pagination-info">
      <span class="fa fa-info-circle" />
      Due to a limitation, we can't display more than 1000 pages. Please, filter your search.
    </p>
  </div>
</template>

<script>
export default {
  props: {
    total: Number,
    displayPages: {
      type: Number,
      default: 9,
    },
    from: Number,
    size: Number,
    maxPage: Number,
    numberInPage: Number,
  },
  computed: {
    pages() {
      const totalPage = Math.max(Math.ceil(this.total / this.size), 1);
      return totalPage <= this.maxPage ? totalPage : this.maxPage;
    },
    pager() {
      const displayedPages = [];
      let maximum = Math.min(this.pages, this.displayPages);
      let start = 1;

      if (this.pages > this.displayPages) {
        if (this.currentPage + Math.ceil(this.displayPages / 2) > this.pages) {
          start = this.pages - (this.displayPages - 1);
          maximum = this.pages;
        } else if (this.currentPage > Math.ceil(this.displayPages / 2)) {
          start = Math.ceil(this.currentPage - this.displayPages / 2);
          maximum = start + (this.displayPages - 1);
        }
      }

      for (let i = start; i <= maximum; i++) {
        displayedPages.push(i);
      }

      return displayedPages;
    },
    currentPage() {
      if (this.from === 0) {
        return 1;
      }

      return this.from / this.size + 1;
    },
    lastPageLimitation() {
      return this.currentPage === this.maxPage;
    },
  },
  methods: {
    setCurrentPage(currentPage) {
      this.$emit('change-page', currentPage * this.size - this.size);
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.$emit('change-page', (this.currentPage - 1) * this.size - this.size);
      }
    },
    nextPage() {
      if (this.currentPage < this.pages) {
        this.$emit('change-page', (this.currentPage + 1) * this.size - this.size);
      }
    },
    firstPage() {
      this.setCurrentPage(1);
    },
    lastPage() {
      this.setCurrentPage(this.pages);
    },
  },
};
</script>

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
