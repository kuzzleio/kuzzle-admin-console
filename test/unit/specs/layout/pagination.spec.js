import Vue from 'vue'
import Pagination from '../../../../src/components/Layout/Pagination'

describe('Pagination', () => {
  it('should init default value', () => {
    let vm = new Vue({
      template: '<div><pagination v-ref:pagination></pagination></div>',
      components: {
        Pagination
      }
    }).$mount()

    expect(vm.$refs.pagination.limit).to.be.equals(10)
    expect(vm.$refs.pagination.displayPages).to.be.equals(9)
  })

  it('should calculate page total correctly', () => {
    let vm = new Vue({
      template: '<div><pagination v-ref:pagination :limit="10" :total="100"></pagination></div>',
      components: {
        Pagination
      }
    }).$mount()

    expect(vm.$refs.pagination.pages).to.be.equal(10)

    vm = new Vue({
      template: '<div><pagination v-ref:pagination :limit="10" :total="0"></pagination></div>',
      components: {
        Pagination
      }
    }).$mount()

    expect(vm.$refs.pagination.pages).to.be.equal(1)
  })

  describe('Page list', () => {
    it('should calculate correctly with default display pages', () => {
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :current-page="1" :limit="10" :total="3"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([1])

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :current-page="1" :limit="10" :total="100"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9])

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :current-page="25" :limit="10" :total="1000"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([21, 22, 23, 24, 25, 26, 27, 28, 29])

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :current-page="100" :limit="10" :total="1000"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([92, 93, 94, 95, 96, 97, 98, 99, 100])
    })

    it('should calculate correctly with custom display pages', () => {
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          :current-page="1" 
          :limit="10" 
          :total="100" 
          :display-pages="5"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([1, 2, 3, 4, 5])

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          :current-page="25" 
          :limit="10" 
          :total="1000" 
          :display-pages="5"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([23, 24, 25, 26, 27])

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          :current-page="100" 
          :limit="10" 
          :total="1000" 
          :display-pages="5"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([96, 97, 98, 99, 100])
    })
  })

  describe('Methods', () => {
    it('setCurrentPage must set the page and dispatch event', () => {
      let spyChangePage = sinon.spy()
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          @change-page="changePage"
          :current-page="1" 
          :limit="10" 
          :total="100"></pagination>
        </div>`,
        components: {
          Pagination
        },
        methods: {
          changePage: spyChangePage
        }
      }).$mount()

      vm.$refs.pagination.setCurrentPage(2)

      expect(vm.$refs.pagination.currentPage).to.be.equals(2)
      expect(spyChangePage.calledWith(2)).to.be.ok
    })

    it('previousPage should decrement current page', () => {
      let spyChangePage = sinon.spy()
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          @change-page="changePage"
          :current-page="2" 
          :limit="10" 
          :total="100"></pagination>
        </div>`,
        components: {
          Pagination
        },
        methods: {
          changePage: spyChangePage
        }
      }).$mount()

      vm.$refs.pagination.previousPage()
      expect(vm.$refs.pagination.currentPage).to.be.equals(1)
      expect(spyChangePage.calledWith(1)).to.be.ok

      vm.$refs.pagination.previousPage()
      expect(vm.$refs.pagination.currentPage).to.be.equals(1)
      expect(spyChangePage.calledWith(1)).to.be.ok
    })

    it('previousPage should increment current page', () => {
      let spyChangePage = sinon.spy()
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          @change-page="changePage"
          :current-page="9" 
          :limit="10" 
          :total="100"></pagination>
        </div>`,
        components: {
          Pagination
        },
        methods: {
          changePage: spyChangePage
        }
      }).$mount()

      vm.$refs.pagination.nextPage()
      expect(vm.$refs.pagination.currentPage).to.be.equals(10)
      expect(spyChangePage.calledWith(10)).to.be.ok

      vm.$refs.pagination.nextPage()
      expect(vm.$refs.pagination.currentPage).to.be.equals(10)
      expect(spyChangePage.calledWith(10)).to.be.ok
    })
  })

  describe('Watchers', () => {
    it('currentPage must not be greater than total pages', (done) => {
      let spyChangePage = sinon.spy()
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          @change-page="changePage"
          :current-page="10" 
          :limit="10" 
          :total="100"></pagination>
        </div>`,
        components: {
          Pagination
        },
        methods: {
          changePage: spyChangePage
        }
      }).$mount()

      vm.$refs.pagination.setCurrentPage(12)
      Vue.nextTick(() => {
        expect(vm.$refs.pagination.currentPage).to.be.equals(10)
        expect(spyChangePage.calledWith(10)).to.be.ok
        done()
      })
    })

    it('currentPage must not be lower than 1', (done) => {
      let spyChangePage = sinon.spy()
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          @change-page="changePage"
          :current-page="10" 
          :limit="10" 
          :total="100"></pagination>
        </div>`,
        components: {
          Pagination
        },
        methods: {
          changePage: spyChangePage
        }
      }).$mount()

      vm.$refs.pagination.setCurrentPage(-1)
      Vue.nextTick(() => {
        expect(vm.$refs.pagination.currentPage).to.be.equals(1)
        expect(spyChangePage.calledWith(1)).to.be.ok
        done()
      })
    })
  })
})
