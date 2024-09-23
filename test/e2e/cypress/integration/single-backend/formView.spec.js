describe('Form view', function() {
  const kuzzleUrl = 'http://localhost:7512'
  const indexName = 'testindex'
  const collectionName = 'testcollection'
  const documentId = 'testdoc'

  beforeEach(() => {
    // reset database and setup
    cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
    cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
    cy.request('POST', `${kuzzleUrl}/${indexName}/_create`)
    cy.request('PUT', `${kuzzleUrl}/${indexName}/${collectionName}`, {
      properties: {
        name: {
          type: 'keyword'
        },
        age: {
          type: 'integer'
        },
        items: {
          type: 'object'
        },
        skill: {
          properties: {
            name: { type: 'keyword' },
            level: { type: 'integer' }
          }
        },
        job: {
          type: 'text'
        },
        employeeOfTheMonthSince: {
          type: 'date'
        }
      }
    })
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}/_create?refresh=wait_for`,
      {
        name: 'Chef',
        age: 42,
        items: {
          phone: 'Blackberry',
          car: 'Laguna'
        },
        skill: {
          name: 'managment',
          level: 1
        },
        job: 'Always asking Esteban to do his job',
        employeeOfTheMonthSince: '1996-07-10'
      }
    )

    cy.initLocalEnv(Cypress.env('BACKEND_VERSION'))
  })

  it('should be able to create a new document with the form view enabled', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="CreateDocument-btn"').click()

    cy.get('[data-cy="formView-switch"').click({ force: true })
    cy.get('[data-cy="DocumentCreate-input--id"').type('new-doc')

    cy.get('input#age').type('31')

    cy.get('[name="items"] > textarea.ace_text-input')
      .type(`{selectall}{backspace}{
"desktop": "standing"`,
        {
          delay: 200,
          force: true
        }
      )

    cy.get('[name="skill"] > textarea.ace_text-input')
      .type(`{selectall}{backspace}{
"name": "CSS",
"level": 60`,
        {
          delay: 200,
          force: true
        }
      )

    cy.get('textarea#job').type('webmestre enginer')
    cy.get('input#name').type('Bombi')

    cy.get('[data-cy="datePickerInput"').type('2020-01-01')
    cy.get('[data-cy="timePickerInput"').type('23:30:00')

    cy.get('[data-cy="DocumentCreate-btn"').click({ force: true })

    cy.contains('new-doc')
    cy.request(
      'GET',
      `${kuzzleUrl}/${indexName}/${collectionName}/new-doc`
    ).then(res => {
      const date = new Date('2020-01-01 23:30:00')

      expect(res.body.result._source.employeeOfTheMonthSince).to.be.equals(
        date.getTime().toString()
      )
      expect(res.body.result._source.items.desktop).to.be.equals('standing')
      expect(res.body.result._source.skill.name).to.be.equals('CSS')
      expect(res.body.result._source.skill.level).to.be.equals(60)
    })
  })

  it.only('should be able to update a document with the form view enabled', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="DocumentListItem-update--testdoc"').click()

    cy.get('[data-cy="formView-switch"').click({ force: true })

    cy.get('input#age').type('{selectall}{backspace}43')

    cy.get('[data-cy="datePickerInput"')
      .clear()
      .type('2020-01-02')
    cy.get('[data-cy="timePickerInput"')
      .clear()
      .type('23:30:00')



    cy.get('[name="skill"] > textarea.ace_text-input')
      .type(`{selectall}{backspace}{
"name": "management",
"level": 0`,
        {
          delay: 200,
          force: true
        }
      )

    cy.get('[data-cy="DocumentUpdate-btn"').click({ force: true })

    cy.request(
      'GET',
      `${kuzzleUrl}/${indexName}/${collectionName}/${documentId}`
    ).then(res => {
      const date = new Date('2020-01-02 23:30:00')

      expect(res.body.result._source.age).to.be.equals(43)
      expect(res.body.result._source.employeeOfTheMonthSince).to.be.equals(
        date.getTime().toString()
      )
      expect(res.body.result._source.skill.level).to.be.equals(0)
    })
  })

  it('should be able to keep synchronized the form view and the JSON view', function() {
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="DocumentListItem-update--testdoc"').click()

    cy.get('textarea.ace_text-input')
      .type(`{selectall}{backspace}{
"name": "PHP CEO"`,
        {
          delay: 200,
          force: true
        }
      )

    cy.get('[data-cy="formView-switch"').click({ force: true })

    cy.get('input#name').should('have.value', 'PHP CEO')
  })

  it('should show a warning if a field type is unsuported', function() {
    cy.request(
      'POST',
      `${kuzzleUrl}/${indexName}/${collectionName}/witharraydoc/_create?refresh=wait_for`,
      {
        name: ['PHP', 'CEO'],
        age: 42
      }
    )
    cy.visit(`/#/data/${indexName}/${collectionName}`)

    cy.get('[data-cy="DocumentListItem-update--witharraydoc"').click()

    cy.get('[data-cy="formView-switch"').click({ force: true })

    cy.get('[data-cy="form-view-warning"').should('be.visible')
  })
})
