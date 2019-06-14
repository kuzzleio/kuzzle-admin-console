describe('Document List', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      properties: {
        date: {
          type: 'date'
        },
        value: {
          type: 'integer'
        },
        value2: {
          type: 'integer'
        }
      }
    })
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      firstName: 'Luca',
      lastName: 'Marchesini',
      job: 'Blockchain as a Service'
    })

    // create environment
    const validEnvName = 'valid'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [validEnvName]: {
          name: validEnvName,
          color: '#002835',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: null
        }
      })
    )
  })

  it('sets and persists the listViewType param accessing a collection', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.url().should('contain', 'listViewType=list')
  })

  it('shows list items when viewType is set to list', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.DocumentList-list .collection-item')
      .children()
      .should('have.class', 'DocumentListItem')
  })

  it('sets and persists the listViewType param when switching the list view', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.ListViewButtons-btn[title~="boxes"]').click()
    cy.url().should('contain', 'listViewType=boxes')
    cy.get('.ListViewButtons-btn[title~="list"]').click()
    cy.url().should('contain', 'listViewType=list')
  })

  it('shows boxed items when viewType is set to boxes', function() {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.ListViewButtons-btn[title~="boxes"]').click()
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')
  })

  it('remembers the list view settings when navigating from one collection to another', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/anothercollection`)
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/anothercollection/_create`, {
      firstName: 'Adrien',
      lastName: 'Maret',
      job: 'Blockchain Keylogger as a Service'
    })
    cy.get('.ListViewButtons-btn[title~="boxes"]').click()
    cy.get('.Treeview-root .tree-item')
      .contains('anothercollection')
      .click()

    cy.get('.Treeview-root .tree-item')
      .contains(collectionName)
      .click()
    cy.url().should('contain', 'listViewType=boxes')
    cy.get('.DocumentList-boxes')
      .children()
      .should('have.class', 'DocumentBoxItem')

    cy.get('.Treeview-root .tree-item')
      .contains('anothercollection')
      .click()
    cy.url().should('contain', 'listViewType=list')
    cy.get('.DocumentList-list .collection-item')
      .children()
      .should('have.class', 'DocumentListItem')
  })

  it('has items with working dropdowns (even if the ID contains weird characters)', function() {
    const adrienID = 'adrien maret'
    const nicoID = 'nico_juelle'
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${adrienID}/_create`,
      {
        firstName: 'Adrien',
        lastName: 'Maret',
        job: 'Blockchain Keylogger as a Service'
      }
    )
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${nicoID}/_create`,
      {
        firstName: 'Nico',
        lastName: 'Juelle',
        job: 'Standing-desk Advocacy Superstar'
      }
    )

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.DocumentListItem')
      .contains(adrienID)
      .parent()
      .siblings('.DocumentListItem-actions')
      .children('.DocumentListItem-dropdown')
      .click()
      .contains('Delete')

    cy.get('.Headline').click()

    cy.get('.DocumentListItem')
      .contains(nicoID)
      .parent()
      .siblings('.DocumentListItem-actions')
      .children('.DocumentListItem-dropdown')
      .click()
      .contains('Delete')
  })

  it('should handle the column view properly', function() {
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/_create`, {
      jsonObject: {
        "foo": "bar"
      }
    })

    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.get('.ListViewButtons-btn[title~="column"]').click()
    cy.url().should('contain', 'listViewType=column')
    
    cy.get('.card-panel > .DocumentsPage-filtersAndButtons > .col > .ListViewButtons > .ListViewButtons-btn:nth-child(2)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result').click({ force: true })
    cy.get('tbody > tr > .DocumentColumnItem > .relative > a').click()
    cy.get('.DocumentListViewColumn-jsonFormatter > .json-formatter-row > .json-formatter-toggler-link > .json-formatter-value > span > .json-formatter-constructor-name').click()
    cy.get('tbody > tr > .DocumentColumnItem > .relative > a').click()
    cy.get('.centered > thead > tr > th:nth-child(7) > .fa').click()
    cy.get('.centered > thead > tr > th:nth-child(6) > .fa').click()
    cy.get('.centered > thead > tr > th:nth-child(5) > .fa').click()
    cy.get('.centered > thead > tr > th:nth-child(4) > .fa').click()
    cy.get('.centered > thead > tr > th > .fa').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('form > .row > .col > .Autocomplete > .ListViewColumnInput').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result').click({ force: true })
  })

  it('should handle the time series view properly', function() {
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/myId/_create`, {
      date: '2019-01',
      value: 10,
      value2: 4
    })
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/myId2/_create`, {
      date: '2019-02',
      value: 24,
      value2: 56
    })
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/myId3/_create`, {
      date: '2019-03',
      value: 20,
      value2: 10
    })
  
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)
  
    cy.get('.card-panel > .DocumentsPage-filtersAndButtons > .col > .ListViewButtons > .ListViewButtons-btn:nth-child(4)').click()
    cy.get('.col > .col > .col > .Autocomplete > input').click()
    cy.get('.col > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result').click()
    cy.get('.TimeSeriesValueSelector > .row > .col > .Autocomplete > input').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result:nth-child(1)').click()
    cy.get('.col > .TimeSeriesValueSelector > .row:nth-child(1) > .col > .TimeSeriesColorPickerBtn').click()
    cy.get('.TimeSeriesColorPicker:nth-child(3) > .vc-chrome-body > .vc-chrome-controls > .vc-chrome-sliders > .vc-chrome-hue-wrap > .vc-hue > .vc-hue-container').click()
    cy.get('.card-panel > .row > .DocumentList-timeseries > .DocumentList-materializeCollection > .col').click()
    cy.get('.TimeSeriesValueSelector > .row > .col > .Autocomplete > input').click()
    cy.get('.row > .col > .Autocomplete > .Autocomplete-results > .Autocomplete-result').click()
    cy.get('.TimeSeriesValueSelector > .row > .col > .Autocomplete > input').click()
    cy.get('.card-panel > .row > .DocumentList-timeseries > .DocumentList-materializeCollection > .col').click()
    cy.get('.col > .TimeSeriesValueSelector > .row:nth-child(2) > .col > .far').click()
    cy.get('.col > .TimeSeriesValueSelector > .row > .col > .far').click()
  })
})

describe('Document update/replace', () => {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/${collectionName}/myId/_create`, {
      foo: 'bar',
      more: 'moar'
    })

    const validEnvName = 'valid'
    localStorage.setItem(
      'environments',
      JSON.stringify({
        [validEnvName]: {
          name: validEnvName,
          color: '#002835',
          host: 'localhost',
          ssl: false,
          port: 7512,
          token: null
        }
      })
    )
  })

  it('should update a document', () => {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.DocumentListItem').should('be.visible')
    cy.get('.DocumentListItem')
    .contains('myId')
    .parent()
    .siblings('.DocumentListItem-actions')
    .children('.DocumentListItem-update')
    .click()

    cy.get('.col > .card-content > #document > .ace_scroller > .ace_content')
    .should('be.visible')
    cy.wait(2000)
    
    cy.get('textarea.ace_text-input')
    .type('{selectall}{backspace}', {delay: 200, force: true})
    .type(`{
      "foo":"changed"`, {
      force: true
    })
    cy.get('.DocumentUpdate')
    .click()

    cy.request('GET', `${kuzzleUrl}/${indexName}/${collectionName}/myId`)
    .then(res => {
      expect(res.body.result._source.foo).to.be.equals('changed')
      expect(res.body.result._source.more).to.be.equals('moar')
    })
  })

  it('should replace a document', () => {
    cy.visit('/')
    cy.get('.LoginAsAnonymous-Btn').click()
    cy.contains('Indexes')
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('.DocumentListItem').should('be.visible')
    cy.get('.DocumentListItem')
    .contains('myId')
    .parent()
    .siblings('.DocumentListItem-actions')
    .children('.DocumentListItem-update')
    .click()

    cy.get('.col > .card-content > #document > .ace_scroller > .ace_content')
    .should('be.visible')

    cy.get('textarea.ace_text-input')
    .should('be.visible')
    cy.wait(2000)
    
    cy.get('textarea.ace_text-input')
    .type('{selectall}{backspace}', {delay: 200, force: true})
    .type(`{
      "foo":"changed"`, {
      force: true
    })
    cy.get('.DocumentReplace')
    .click({force: true})

    cy.get('.DocumentListItem')
    .should('be.visible')

    cy.request('GET', `${kuzzleUrl}/${indexName}/${collectionName}/myId`)
    .then(res => {
      expect(res.body.result._source.foo).to.be.equals('changed')
      expect(res.body.result._source.more).to.be.undefined
    })
  })
})