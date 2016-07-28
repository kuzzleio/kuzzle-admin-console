import jsonFormatter from '../../../../src/directives/json-formatter.directive'

describe('Directives tests', () => {
  it('should format JSON object to html formatter', () => {
    jsonFormatter.el = {
      appendChild: sinon.spy()
    }
    jsonFormatter.update({foo: 'bar'})
    expect(jsonFormatter.el.appendChild.called).to.be.ok
  })
})
