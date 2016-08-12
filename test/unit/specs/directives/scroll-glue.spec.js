import ScrollGlue from '../../../../src/directives/scroll-glue.directive'

describe('ScrollGlue directive tests', () => {
  let scrollGlue

  beforeEach(() => {
    scrollGlue = ScrollGlue
    scrollGlue.el = window.document.implementation.createHTMLDocument('element').createElement('p')
  })

  it('should init and remove scroll detection', () => {
    expect(scrollGlue.scrollListener).to.be.not.ok

    scrollGlue.bind()

    expect(scrollGlue.scrollListener).to.be.ok

    scrollGlue.unbind()

    expect(scrollGlue.scrollListener).to.be.not.ok
  })

  it('should detect onscroll action', () => {
    scrollGlue.bind()

    expect(scrollGlue.scrolled).to.be.not.ok

    window.onscroll()

    expect(scrollGlue.scrolled).to.be.ok
  })

  it('should remove closed class if user scroll more than height', () => {
    scrollGlue.scrolled = true
    scrollGlue.height = 10
    window.scrollY = 20
    scrollGlue.el.classList.add('closed')

    scrollGlue.checkDisplay()

    expect(scrollGlue.el.classList.contains('closed')).to.be.not.ok
  })

  it('should add closed class if user scroll less than height', () => {
    scrollGlue.scrolled = true
    scrollGlue.height = 10
    window.scrollY = 5
    scrollGlue.el.className = ''

    scrollGlue.checkDisplay()

    expect(scrollGlue.el.classList.contains('closed')).to.be.ok
  })
})
