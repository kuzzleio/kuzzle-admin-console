import Vue from 'vue'
import Dropdown from '../../../../../src/components/Materialize/Dropdown'

describe.only('Materialize dropdown', () => {
  let $vm

  before(() => {
    let vm = new Vue({
      template: '<div><dropdown v-ref:dropdown></dropdown></div>',
      components: {
        Dropdown
      }
    }).$mount()

    $vm = vm.$refs.dropdown
  })

  describe('Computed', () => {
    describe('parsedId', () => {
      it('should return null if id is null', () => {
        $vm.id = null
        expect($vm.parsedId).to.be.equal(null)
      })

      it('should return the same id if no special character', () => {
        $vm.id = 'toto'
        expect($vm.parsedId).to.be.equal('toto')
      })

      it('should escape with \\ special characters', () => {
        $vm.id = '%kuzzle'
        expect($vm.parsedId).to.be.equal('\\%kuzzle')

        $vm.id = ';:kuzzle2'
        expect($vm.parsedId).to.be.equal('\\;\\:kuzzle2')

        $vm.id = '+kuzzle3'
        expect($vm.parsedId).to.be.equal('\\+kuzzle3')

        $vm.id = '_kuzzle4'
        expect($vm.parsedId).to.be.equal('\\_kuzzle4')

        $vm.id = '()kuzzle5'
        expect($vm.parsedId).to.be.equal('\\(\\)kuzzle5')
      })
    })
  })
})
