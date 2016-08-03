import Vue from 'vue'
import Pagination from '../../../../src/components/Materialize/Pagination'

describe('Pagination', () => {
  it('should calculate page total correctly', () => {
    let vm = new Vue({
      template: '<div><pagination v-ref:pagination :size="10" :total="100"></pagination></div>',
      components: {
        Pagination
      }
    }).$mount()

    expect(vm.$refs.pagination.pages).to.be.equal(10)

    vm = new Vue({
      template: '<div><pagination v-ref:pagination :size="10" :total="0"></pagination></div>',
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
          <pagination v-ref:pagination :from="0" :size="10" :total="3"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([1])

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :from="0" :size="10" :total="100"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9])

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :from="240" :size="10" :total="1000"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.pager).to.eql([21, 22, 23, 24, 25, 26, 27, 28, 29])

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :from="990" :size="10" :total="1000"></pagination>
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
          :from="0" 
          :size="10" 
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
          :from="240" 
          :size="10" 
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
          :from="990" 
          :size="10" 
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

  describe('Current page', () => {
    it('should calculate correctly the current page', () => {
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :from="0" :size="10" :total="100"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.currentPage).to.eql(1)

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :from="240" :size="10" :total="1000"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.currentPage).to.eql(25)

      vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination :from="990" :size="10" :total="1000"></pagination>
        </div>`,
        components: {
          Pagination
        }
      }).$mount()
      expect(vm.$refs.pagination.currentPage).to.eql(100)
    })
  })

  describe('Methods', () => {
    it('setCurrentPage must set the page and dispatch event', () => {
      let spyChangePage = sinon.spy()
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          @change-page="changePage"
          :from="0" 
          :size="10" 
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

      expect(spyChangePage.calledWith(10)).to.be.ok
    })

    it('previousPage should decrement current page', () => {
      let spyChangePage = sinon.spy()
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          @change-page="changePage"
          :from="10" 
          :size="10" 
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
      expect(spyChangePage.calledWith(0)).to.be.ok

      vm.$refs.pagination.previousPage()
      expect(spyChangePage.calledWith(0)).to.be.ok
    })

    it('previousPage should increment current page', () => {
      let spyChangePage = sinon.spy()
      let vm = new Vue({
        template: `<div>
          <pagination v-ref:pagination 
          @change-page="changePage"
          :from="80" 
          :size="10" 
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
      expect(spyChangePage.calledWith(90)).to.be.ok

      vm.$refs.pagination.nextPage()
      expect(spyChangePage.calledWith(90)).to.be.ok
    })
  })
})
