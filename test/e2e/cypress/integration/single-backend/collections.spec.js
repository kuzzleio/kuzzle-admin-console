describe('Collection management', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
    cy.setCookie('telemetry', 'false')
  })

  it('Should render a visual feedback and prevent submitting when input is not valid', () => {
    cy.waitOverlay()
    cy.visit(`/#/data/${indexName}/create`)
    cy.contains('Create a new collection')

    cy.get('[data-cy="CollectionCreateOrUpdate-name"] input').type(' ', {
      force: true
    })

    cy.invalidFeedback('#collection-name').should('contain', 'Please fill-in a valid collection name.')

    cy.get('[data-cy="CollectionCreateOrUpdate-name"] input').type(
      '{selectall}{backspace}',
      {
        force: true
      }
    )

    cy.invalidFeedback('[data-cy="CollectionCreateOrUpdate-name"]').should('contain', 'Please fill-in a valid collection name')

    cy.get('[data-cy="CollectionCreateOrUpdate-submit"]').click()
    cy.shouldStayOn(`#/data/${indexName}/create`)

    cy.get('[data-cy="CollectionCreateOrUpdate-name"] input').type(
      '{selectall}validcoll',
      {
        force: true
      }
    )

    cy.get('[data-cy="JSONEditor"] .ace_line')
      .contains('{')
      .click({ force: true })

    cy.get('[data-cy="JSONEditor"] textarea.ace_text-input')
      .should('exist')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(`SuM UNV4L1d jayZON Kood`)

    cy.get('[data-cy="CollectionCreateOrUpdate-submit"]').click()
    cy.shouldStayOn(`#/data/${indexName}/create`)
  })

  it('Should be able to create a collection and access it', function() {
    cy.visit(`/#/data/${indexName}/create`)

    cy.get('[data-cy=CollectionCreate]').should('be.visible')

    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').click({ force: true })
    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').type(collectionName)
    cy.get('[data-cy="CollectionCreateOrUpdate-submit"]').click({
      force: true
    })
    cy.get(`[data-cy="CollectionList-name--${collectionName}"]`).click({
      force: true
    })
    cy.contains(collectionName)
  })

  it('Should be able to update a collection', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      dynamic: 'true'
    })
    cy.visit(`/#/data/${indexName}/${collectionName}/edit`)
    cy.contains(collectionName)

    cy.get('[data-cy="JSONEditor"] textarea.ace_text-input')
      .should('exist')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"dynamic": false,
"properties":
{
"firstName": {
"type": "keyword"`,
        {
          delay: 200,
          force: true
        }
      )
    cy.get('[data-cy=CollectionCreateOrUpdate-submit]').click()
    cy.get(`[data-cy="CollectionList-edit--${collectionName}"]`).click()
    cy.get('[data-cy="JSONEditor"]')
      .should('contain', '"firstName": {')
      .should('contain', '"type": "keyword"')
  })

  it('Should be able to clear a collection', () => {
    const documentId = 'newDoc'
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      dynamic: 'true'
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_create?refresh=wait_for`,
      {
        message: '...in a bottle...'
      }
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(documentId)
    cy.get('[data-cy="CollectionDropdownAction"]').click()
    cy.get('[data-cy="CollectionDropdown-clear"]').click()
    cy.get('[data-cy="CollectionClearModal-collectionName"]').type(
      collectionName
    )
    cy.get('[data-cy="CollectionClearModal-submit"]').click()
    cy.get('[data-cy=DocumentsEmptyState]').should('exist')
  })

  it('Should be able to delete a stored collection from the collection list', function() {
    cy.skipOnBackendVersion(1)

    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)

    cy.visit(`/#/data/`)
    cy.visit(`/#/data/${indexName}/`)
    cy.contains(indexName)

    cy.get(`[data-cy="CollectionList-delete--${collectionName}"]`).click()
    cy.get('[data-cy="DeleteCollectionModal-confirm"]').type(collectionName)
    cy.get('[data-cy="DeleteCollectionModal-OK"]').click()

    cy.get('[data-cy="CollectionList-table"]').should(
      'not.contain',
      collectionName
    )
  })

  it('Should be able to bulk delete some stored collections from the collection list', function() {
    cy.skipOnBackendVersion(1)

    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}1`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}2`)

    cy.visit(`/#/data/`)

    cy.visit(`/#/data/${indexName}/`)

    cy.get(`[data-cy="CollectionList-checkbox--${collectionName}1"]`).click({
      force: true
    })

    cy.get(`[data-cy="CollectionList-checkbox--${collectionName}2"]`).click({
      force: true
    })

    cy.get(`[data-cy=CollectionList-bulkDelete--btn]`).click()

    cy.get(
      '[data-cy="BulkDeleteCollectionsModal-input-confirmation"]'
    ).type('DELETE', { force: true })

    cy.get('[data-cy="BulkDeleteCollectionsModal-deleteBtn"]').click()

    cy.get('[data-cy=CollectionList]').should('not.contain', `${collectionName}1`)
    cy.get('[data-cy=CollectionList]').should('not.contain', `${collectionName}2`)
  })

  it('Should be able to delete a stored collection from its own dropdown action', function() {
    cy.skipOnBackendVersion(1)

    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)

    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)
    cy.get('[data-cy="CollectionDropdownAction"]').click()
    cy.get('[data-cy="CollectionDropdown-delete"]').should('be.visible').click()
    cy.get('[data-cy="DeleteCollectionModal-confirm"]').type(collectionName)
    cy.get('[data-cy="DeleteCollectionModal-OK"]').click()

    cy.get('[data-cy="CollectionList-table"]').should(
      'not.contain',
      collectionName
    )
  })

  it('Should disable delete stored collections for Kuzzle v1', () => {
    cy.skipUnlessBackendVersion(1)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)

    cy.visit(`/#/data/`)
    cy.visit(`/#/data/${indexName}/`)
    cy.contains(indexName)
    cy.get(`[data-cy="CollectionList-delete--${collectionName}"]`).should(
      'not.exist'
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)
    cy.contains(collectionName)
    cy.get('[data-cy="CollectionDropdownAction"]').click()
    cy.get('[data-cy="CollectionDropdown-delete"]').should('not.exist')
  })

  it('Should be able to fetch collections when index change', function() {
    cy.request('POST', `${kuzzleUrl}/anotherindex/_create`)
    cy.request('PUT', `${kuzzleUrl}/anotherindex/foo`)

    cy.visit(`/#/data/`)
    cy.visit(`/#/data/${indexName}/`)
    cy.contains(indexName)
    cy.get('[data-cy="Treeview-item-index--anotherindex"]').click()
    cy.get('[data-cy="CollectionList-table"]').contains('foo')
  })

  it('Should be able to autofocus collection search', () => {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/foobar`)

    cy.waitOverlay()

    cy.visit(`/#/data/${indexName}/`)

    // Le raccourci clavier vise la recherche de collections : il faut que la
    // liste soit chargée, pas seulement que la page réponde.
    cy.get('[data-cy="CollectionList-table"]').should('contain', 'foobar')

    cy.get('body').type('f{enter}')

    cy.url().should('contain', 'foobar')
    cy.contains('foobar')
    cy.get('[data-cy=DocumentsEmptyState]').should('exist')
  })

  // Le menu d'actions d'un index n'avait aucune spec : il n'est monté que par
  // l'en-tête de la liste des collections, et la suppression d'index n'était
  // couverte que depuis la page Indexes, qui passe par un autre bouton.
  it('Should be able to delete the index from the collection list', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)
    cy.visit(`/#/data/${indexName}`)

    cy.get('[data-cy="CollectionList-name--' + collectionName + '"]').should('be.visible')

    cy.get('[data-cy="IndexDropdownAction"]').click()
    cy.get('[data-cy="IndexDropdown-delete"]').click()

    cy.get('[data-cy="DeleteIndexModal-name"]').type(indexName, { force: true })
    cy.get('[data-cy="DeleteIndexModal-deleteBtn"]').click()

    cy.get('[data-cy=IndexesPage]').should('not.contain', indexName)
  })

  it('Should be able to export a collection mapping', function() {
    cy.visit(`/#/data/${indexName}/create`)

    cy.get('[data-cy=CollectionCreate]').should('be.visible')
    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').click({ force: true })
    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').type('testexport')
    cy.get('[data-cy="JSONEditor"] textarea.ace_text-input')
      .should('exist')
      .type('{selectall}{backspace}', { delay: 200, force: true })
      .type(
        `{
"firstName": {
"type": "keyword"`,
        {
          force: true
        }
      )

    // test filename
    cy.get('[data-cy="export-collection-mapping"]').should(
      'have.attr',
      'download',
      `valid-${indexName}-testexport-mapping.json`
    )

    // test file content
    cy.get('[data-cy="export-collection-mapping"]')
      .then(
        anchor =>
          new Cypress.Promise(resolve => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', anchor.prop('href'), true)
            xhr.responseType = 'blob'
            xhr.onload = () => {
              if (xhr.status === 200) {
                const blob = xhr.response
                const reader = new FileReader()
                reader.onload = () => {
                  resolve(reader.result)
                }
                reader.readAsText(blob)
              }
            }
            xhr.send()
          })
      )
      .should('equal', `{"firstName":{"type":"keyword"}}`)
  })

  // Le tri de la colonne « Name » n'a jamais eu de spec : il est couvert ici
  // AVANT d'être réécrit sans `b-table` (ADR-0011, décision 4).
  it('Should be able to sort the collections by name', function() {
    const collections = ['charliecoll', 'alphacoll', 'bravocoll']
    collections.forEach(name =>
      cy.request('PUT', `${kuzzleUrl}/${indexName}/${name}`)
    )

    cy.visit(`/#/data/${indexName}`)
    cy.get('[data-cy=CollectionList-table] tbody tr').should('have.length', 3)

    cy.get('[data-cy=CollectionList-table] thead th')
      .contains('Name')
      .click()
    cy.get('[data-cy=CollectionList-table] tbody tr')
      .eq(0)
      .should('contain', 'alphacoll')
    cy.get('[data-cy=CollectionList-table] tbody tr')
      .eq(2)
      .should('contain', 'charliecoll')

    cy.get('[data-cy=CollectionList-table] thead th')
      .contains('Name')
      .click()
    cy.get('[data-cy=CollectionList-table] tbody tr')
      .eq(0)
      .should('contain', 'charliecoll')
    cy.get('[data-cy=CollectionList-table] tbody tr')
      .eq(2)
      .should('contain', 'alphacoll')
  })

  // Le filtre porte sur le nom, pas sur la ligne entière : `stored` est le type
  // de toutes les collections listées ici, et ne doit rien remonter (ADR-0011).
  it('Should filter the collections on their name only', function() {
    cy.request('PUT', `${kuzzleUrl}/${indexName}/foocollection`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/barcollection`)

    cy.visit(`/#/data/${indexName}`)
    cy.get('[data-cy=CollectionList-table] tbody tr').should('have.length', 2)

    cy.get('[data-cy=CollectionList-filter]').type('stored')

    cy.get('[data-cy=CollectionList-table]').should(
      'contain',
      'There is no collection matching your filter'
    )
  })

  // Ce que `b-dropdown` faisait et qu'aucune spec n'exerçait : la fermeture au
  // clic extérieur, la touche Échap, la navigation aux flèches, et l'état de
  // l'élément courant. Réécrit en Vue 2 à la main (ADR-0012), donc couvert ici
  // avant de l'être par la confiance (ADR-0011, point 4).
  describe('View dropdown', function() {
    beforeEach(() => {
      cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`)
      cy.visit(`/#/data/${indexName}/${collectionName}`)
      cy.contains(collectionName)
    })

    it('Should close on a click outside the menu', function() {
      cy.get('[data-cy="CollectionDropdownView"]').click()
      cy.get('[data-cy="CollectionDropdown-list"]').should('be.visible')

      cy.get('body').click('bottomLeft')

      cy.get('[data-cy="CollectionDropdown-list"]').should('not.exist')
    })

    it('Should close on Escape and give the focus back to the trigger', function() {
      cy.get('[data-cy="CollectionDropdownView"]').click()
      cy.get('[data-cy="CollectionDropdown-list"]').should('be.visible')

      cy.get('body').type('{esc}')

      cy.get('[data-cy="CollectionDropdown-list"]').should('not.exist')
      cy.focused().should('have.attr', 'data-cy', 'CollectionDropdownView')
    })

    it('Should open on the down arrow and focus the first item', function() {
      cy.get('[data-cy="CollectionDropdownView"]')
        .focus()
        .type('{downarrow}')

      cy.focused().should('have.attr', 'data-cy', 'CollectionDropdown-list')

      cy.focused().type('{downarrow}')
      cy.focused().should('have.attr', 'data-cy', 'CollectionDropdown-column')
    })

    it('Should announce the current view among the others', function() {
      cy.get('[data-cy="CollectionDropdownView"]').click()

      cy.get('[data-cy="CollectionDropdown-list"]').should(
        'have.attr',
        'aria-checked',
        'true'
      )
      cy.get('[data-cy="CollectionDropdown-column"]').should(
        'have.attr',
        'aria-checked',
        'false'
      )
    })

    // Un élément désactivé posait une classe et laissait passer le clic ; le
    // seul garde-fou était que l'action derrière ne faisait rien.
    it('Should not act on a disabled item', function() {
      cy.get('[data-cy="CollectionDropdownView"]').click()
      cy.get('[data-cy="CollectionDropdown-map"]').click({ force: true })

      // Le menu reste ouvert et la vue n'a pas changé : le clic n'a rien
      // sélectionné, il n'a pas seulement échoué à naviguer.
      cy.get('[data-cy="CollectionDropdown-map"]').should('be.visible')
      cy.location('hash').should('not.contain', 'listViewType=map')
    })
  })
})
