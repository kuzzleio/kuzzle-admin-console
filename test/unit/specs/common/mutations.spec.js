import { mutations } from '../../../../src/vuex/modules/common/store'

const { SET_ERROR, UNSET_ERROR } = mutations

describe('common mutations test', () => {
  it('should set an error', () => {
    let stat = {error: null}

    SET_ERROR(stat, 'foo')
    expect(stat.error).to.equals('foo')
  })

  it('should unset an error', () => {
    let stat = {error: null}

    UNSET_ERROR(stat)
    expect(stat.error).to.be.null
  })
})
