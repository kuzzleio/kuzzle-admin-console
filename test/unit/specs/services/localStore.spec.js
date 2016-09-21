import { removeIndex } from '../../../../src/services/localStore'

let sandbox = sinon.sandbox.create()

describe('localStore test', () => {
  afterEach(() => sandbox.restore())

  describe('removeIndex', () => {
    it('should remove the corresponding index from localStore and save the new one', () => {
      // eslint-disable-next-line no-undef
      let getItem = sandbox.stub(localStorage, 'getItem')
      // eslint-disable-next-line no-undef
      let setItem = sandbox.stub(localStorage, 'setItem')

      getItem.returns('[{"index": "toto", "collection": "my-collection"}, {"index": "tutu", "collection": "other-collection"}]')

      removeIndex('toto')

      expect(setItem.calledWith('realtimeCollections', '[{"index":"tutu","collection":"other-collection"}]')).to.be.equal(true)
    })
  })
})
