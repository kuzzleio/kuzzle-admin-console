import Vue from 'vue'
import Pagination from '../../../../src/components/Layout/Pagination'

describe('Pagination', () => {
  it('should calculate page total correctly', () => {
    let vm = new Vue(Pagination)
    vm.limit = 10
    vm.total = 100
    expect(vm.pages).to.be.equal(10)

    vm = new Vue(Pagination)
    vm.limit = 10
    vm.total = 0
    expect(vm.pages).to.be.equal(1)
  })

  it('should calculate correctly the page list to display', () => {
    let vm = new Vue(Pagination)
    vm.currentPage = 1
    vm.limit = 10
    vm.total = 3
    vm.displayPages = 9
    expect(vm.pager).to.eql([1])

    vm = new Vue(Pagination)
    vm.currentPage = 1
    vm.limit = 10
    vm.total = 100
    vm.displayPages = 9
    expect(vm.pager).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9])

    vm = new Vue(Pagination)
    vm.currentPage = 25
    vm.limit = 10
    vm.total = 1000
    vm.displayPages = 9
    expect(vm.pager).to.eql([21, 22, 23, 24, 25, 26, 27, 28, 29])
  })
})
