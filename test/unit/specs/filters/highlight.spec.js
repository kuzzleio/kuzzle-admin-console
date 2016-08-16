import { highlight } from '../../../../src/filters/highlight.filter'

describe('Highlight filter tests', () => {
  it('should does nothing if value is empty', () => {
    let value = ''
    let filter = ''
    value = highlight(value, filter)
    expect(value).to.be.equal('')
  })
  it('should does nothing if filter not match with value', () => {
    let value = 'foo'
    let filter = 'bar'
    value = highlight(value, filter)
    expect(value).to.be.equal('foo')
  })
  it('should hightlight value if filter is found', () => {
    let value = 'foobarbar'
    let filter = 'bar'
    value = highlight(value, filter)
    expect(value).to.be.equal('foo<strong class="highlight">bar</strong>bar')
  })
})
