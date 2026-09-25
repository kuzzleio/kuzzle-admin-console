// Captures des états d'écran de l'inventaire v4 / v5
// (docs/comparaison-v4-v5/inventaire.md, colonne « Capture »).
//
// Ce fichier n'est PAS une spec : il n'assertionne rien sur le produit et ne
// tourne pas dans `npm run test:e2e`. Il photographie, sur la version servie à
// `baseUrl`, les mêmes états avec les mêmes données. Le même fichier tourne
// contre la v4 et contre la v5 : il ne s'appuie donc que sur des `data-cy`
// communs aux deux, ou sur une liste de sélecteurs quand ils diffèrent
// (`pick`). Mode d'emploi : docs/comparaison-v4-v5/README.md.
//
// Un `it` par état : si un état ne s'atteint pas sur une version, les autres
// sont quand même pris, et le trou se voit sur la planche.

const kuzzleUrl = 'http://localhost:7512'
const LOCALSTORAGE_PREFIX = 'kuz-ac-settings'

const TAXI_INDEX = 'nyc-open-data'
const TAXI = 'yellow-taxi'
const ZONES = 'zones'
const IOT_INDEX = 'iot-sensors'
const MEASURES = 'measures'

// Données fixes : aucune date relative, aucun identifiant aléatoire, pour que
// les deux versions affichent exactement le même contenu.
const vendors = ['CMT', 'VTS', 'DDS']
const taxiDocuments = Array.from({ length: 24 }, (_, i) => ({
  _id: `taxi-${String(i + 1).padStart(3, '0')}`,
  body: {
    vendor: vendors[i % 3],
    passenger_count: (i % 4) + 1,
    fare_amount: 7.5 + i * 1.25,
    trip_distance: Math.round((1.2 + i * 0.37) * 100) / 100,
    pickup_datetime: `2026-07-${String((i % 28) + 1).padStart(2, '0')}T0${i % 10}:15:00Z`,
    location: { lat: 40.70 + (i % 6) * 0.012, lon: -74.01 + (i % 5) * 0.015 },
    notes: i % 5 === 0 ? 'Airport run, luggage' : 'Street hail',
    payment: { type: i % 2 ? 'card' : 'cash', tip: i % 2 ? 2.5 : 0 },
  },
}))
const measureDocuments = Array.from({ length: 12 }, (_, i) => ({
  _id: `m-${String(i + 1).padStart(2, '0')}`,
  body: {
    sensor: `SEN-TH-0${(i % 3) + 1}`,
    measured_at: `2026-07-20T${String(8 + i).padStart(2, '0')}:00:00Z`,
    temperature: 20 + (i % 5) * 0.6,
    humidity: 40 + (i % 7) * 2,
    battery: 100 - i * 3,
  },
}))

function seed() {
  cy.request('POST', `${kuzzleUrl}/admin/_resetDatabase`)
  cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)

  cy.request('POST', `${kuzzleUrl}/${TAXI_INDEX}/_create`)
  cy.request('PUT', `${kuzzleUrl}/${TAXI_INDEX}/${TAXI}`, {
    properties: {
      vendor: { type: 'keyword' },
      passenger_count: { type: 'integer' },
      fare_amount: { type: 'float' },
      trip_distance: { type: 'float' },
      pickup_datetime: { type: 'date' },
      location: { type: 'geo_point' },
      notes: { type: 'text' },
      payment: {
        properties: { type: { type: 'keyword' }, tip: { type: 'float' } },
      },
    },
  })
  cy.request('POST', `${kuzzleUrl}/${TAXI_INDEX}/${TAXI}/_mCreate?refresh=wait_for`, {
    documents: taxiDocuments,
  })
  cy.request('PUT', `${kuzzleUrl}/${TAXI_INDEX}/${ZONES}`, {
    properties: { name: { type: 'keyword' }, area: { type: 'geo_shape' } },
  })
  cy.request('PUT', `${kuzzleUrl}/${TAXI_INDEX}/drivers`)

  cy.request('POST', `${kuzzleUrl}/${IOT_INDEX}/_create`)
  cy.request('PUT', `${kuzzleUrl}/${IOT_INDEX}/${MEASURES}`, {
    properties: {
      sensor: { type: 'keyword' },
      measured_at: { type: 'date' },
      temperature: { type: 'float' },
      humidity: { type: 'integer' },
      battery: { type: 'integer' },
    },
  })
  cy.request('POST', `${kuzzleUrl}/${IOT_INDEX}/${MEASURES}/_mCreate?refresh=wait_for`, {
    documents: measureDocuments,
  })
  cy.request('POST', `${kuzzleUrl}/empty-index/_create`)

  cy.request('PUT', `${kuzzleUrl}/users/_mapping`, {
    properties: { firstName: { type: 'keyword' }, team: { type: 'keyword' } },
  })
  cy.request('POST', `${kuzzleUrl}/roles/data-reader/_create`, {
    controllers: { document: { actions: { get: true, search: true, count: true } } },
  })
  cy.request('POST', `${kuzzleUrl}/roles/data-writer/_create`, {
    controllers: { document: { actions: { '*': true } }, collection: { actions: { '*': true } } },
  })
  cy.request('POST', `${kuzzleUrl}/roles/ops/_create`, {
    controllers: { server: { actions: { '*': true } }, admin: { actions: { '*': true } } },
  })
  cy.request('POST', `${kuzzleUrl}/profiles/reader/_create`, {
    policies: [{ roleId: 'data-reader', restrictedTo: [{ index: TAXI_INDEX }] }],
  })
  cy.request('POST', `${kuzzleUrl}/profiles/writer/_create`, {
    policies: [{ roleId: 'data-reader' }, { roleId: 'data-writer' }],
  })
  cy.request('POST', `${kuzzleUrl}/profiles/operator/_create`, {
    policies: [{ roleId: 'ops' }],
  })
  const users = [
    ['alice', ['reader'], 'Alice', 'data'],
    ['bob', ['writer', 'operator'], 'Bob', 'platform'],
    ['carol', ['operator'], 'Carol', 'platform'],
  ]
  users.forEach(([kuid, profileIds, firstName, team]) => {
    cy.request('POST', `${kuzzleUrl}/users/${kuid}/_create?refresh=wait_for`, {
      content: { profileIds, firstName, team },
      credentials: { local: { username: kuid, password: 'password' } },
    })
  })
}

// Une liste de sélecteurs, le premier trouvé l'emporte : là où la v4 et la v5
// n'exposent pas le même ancrage.
function pick(...selectors) {
  return cy.get(selectors.join(', ')).first()
}

// Couper transitions et animations : une capture prise au milieu d'un fondu
// ne dit rien du rendu. Même traitement sur les deux versions.
Cypress.on('window:load', win => {
  const style = win.document.createElement('style')
  style.textContent =
    '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }'
  win.document.head.appendChild(style)
})

// Spinners des deux versions : `<b-spinner>` et `fa-spin` (v4), primitive
// `Spinner` (v5).
const SPINNERS = '.spinner-border, .spinner-grow, .fa-spin, span.animate-spin[role="status"]'

function settle() {
  cy.get('[data-cy="main-spinner"]').should('not.exist')
  cy.get(SPINNERS).should('not.exist')
  cy.document().its('fonts.status').should('eq', 'loaded')
}

function shot(name) {
  settle()
  cy.screenshot(name, { capture: 'viewport', overwrite: true })
}

function openApp(path, { token = 'anonymous', telemetry = true } = {}) {
  cy.initLocalEnv(2, token)
  if (telemetry) {
    cy.setCookie('telemetry', '"false"')
  }
  cy.visit(`/#${path}`)
}

// `DocumentListItem-<id>` en v4, `DocumentListItem--<id>` en v5.
function documentItem(id) {
  return pick(`[data-cy="DocumentListItem-${id}"]`, `[data-cy="DocumentListItem--${id}"]`)
}

function setListView(index, collection, listViewType) {
  localStorage.setItem(
    `${LOCALSTORAGE_PREFIX}:${index}/${collection}`,
    JSON.stringify({ listViewType })
  )
}

describe('Captures v4 / v5', () => {
  before(() => {
    seed()
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  // C22 coupe le réseau : s'il échoue avant de le rétablir, tous les états
  // suivants tomberaient avec lui.
  afterEach(() => {
    cy.goOnline()
  })

  // 1. Connexions
  it('C01 — création de connexion', () => {
    cy.setCookie('telemetry', '"false"')
    cy.visit('/#/create-connection')
    cy.get('[data-cy="CreateEnvironment-name"]').should('be.visible')
    shot('C01-create-connection')
  })

  it('C02 — création de connexion, validation', () => {
    cy.setCookie('telemetry', '"false"')
    cy.visit('/#/create-connection')
    cy.get('[data-cy="Environment-SubmitButton"]').click()
    shot('C02-create-connection-invalid')
  })

  it('C03 — sélection de connexion', () => {
    cy.initLocalEnv()
    cy.setCookie('telemetry', '"false"')
    cy.visit('/#/select-connection')
    cy.contains('Connect to')
    shot('C03-select-connection')
  })

  it('C04 — sélecteur de connexion ouvert', () => {
    openApp('/data')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy="EnvironmentSwitch-newConnectionBtn"]').should('be.visible')
    shot('C04-environment-switch')
  })

  it('C05 — modale de création de connexion', () => {
    openApp('/data')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy="EnvironmentSwitch-newConnectionBtn"]').click()
    cy.get('[data-cy="EnvironmentCreateModal-submit"]').should('be.visible')
    shot('C05-environment-create-modal')
  })

  it('C06 — modale de suppression de connexion', () => {
    openApp('/data')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy="EnvironmentSwitch-env_valid-delete"]').click()
    cy.get('[data-cy="EnvironmentDeleteModal-envName"]').should('be.visible')
    shot('C06-environment-delete-modal')
  })

  it("C07 — modale d'import de connexions", () => {
    openApp('/data')
    cy.get('[data-cy="EnvironmentSwitch"]').click()
    cy.get('[data-cy="EnvironmentSwitch-newConnectionBtn"]').should('be.visible')
    cy.contains('[role="menuitem"], .dropdown-item', /^\s*Import\s*$/).should('be.visible').click()
    cy.get('[data-cy="EnvironmentImport-fileInput"]').should('exist')
    shot('C07-environment-import-modal')
  })

  // 2. Authentification
  it('C10 — login', () => {
    openApp('/login', { token: null })
    cy.get('[data-cy="Login-username"]').should('be.visible')
    shot('C10-login')
  })

  it('C11 — login, échec', () => {
    openApp('/login', { token: null })
    cy.get('[data-cy="Login-username"]').type('nobody')
    cy.get('[data-cy="Login-password"]').type('wrong')
    cy.get('[data-cy="Login-submitBtn"]').click()
    cy.contains('Login failed')
    shot('C11-login-failed')
  })

  it('C12 — login, bandeau « no administrator »', () => {
    openApp('/login', { token: null })
    cy.get('[data-cy="noAdminWarning"]').should('be.visible')
    shot('C12-login-no-admin')
  })

  it('C13 — signup du premier admin', () => {
    openApp('/signup', { token: null })
    cy.get('[data-cy="Signup-username"]').should('be.visible')
    shot('C13-signup')
  })

  it('C14 — réinitialisation du mot de passe', () => {
    openApp('/reset-password/anonymous', { token: null })
    cy.get('[data-cy="ResetPassword-password"]').should('be.visible')
    shot('C14-reset-password')
  })

  it('C16 — toast « no administrator » après connexion', () => {
    // Masqué par défaut sur localhost (`NO_ADMIN_WARNING_HOSTS`) : on le
    // réactive explicitement sur la connexion.
    cy.initLocalEnv(2, 'anonymous').then(() => {
      const environments = JSON.parse(localStorage.getItem('environments'))
      environments.valid.hideAdminWarning = false
      localStorage.setItem('environments', JSON.stringify(environments))
    })
    cy.setCookie('telemetry', '"false"')
    cy.visit('/#/data')
    cy.contains('Your Kuzzle has no administrator user').should('be.visible')
    shot('C16-no-admin-toast')
  })

  it('C17 — bandeau de télémétrie', () => {
    openApp('/data', { telemetry: false })
    cy.contains('Usage telemetry')
    shot('C17-telemetry-banner')
  })

  // 3. Cadre
  it('C20 — barre de navigation', () => {
    openApp('/data')
    cy.get('[data-cy="IndexesPage-createBtn"]').should('be.visible')
    shot('C20-navbar')
  })

  it('C21 — menu Feedback', () => {
    openApp('/data')
    cy.contains('Feedback').click()
    cy.contains('Talk with our community').should('be.visible')
    shot('C21-feedback-menu')
  })

  it('C22 — backend injoignable', () => {
    openApp('/data')
    cy.get('[data-cy="IndexesPage-createBtn"]').should('be.visible')
    cy.goOffline()
    cy.get('#offline-toast').should('be.visible')
    cy.screenshot('C22-offline', { capture: 'viewport', overwrite: true })
  })

  it('C23 — 404', () => {
    openApp('/nowhere/to/be/found')
    cy.contains('There is nothing here')
    shot('C23-404')
  })

  it('C24 — 404 de données', () => {
    openApp('/data/no-such-index')
    cy.contains("doesn't exist")
    shot('C24-data-404')
  })

  // 4–5. Arbre et index
  it("C30 — arbre, index déplié", () => {
    openApp(`/data/${TAXI_INDEX}`)
    cy.get(`[data-cy="Treeview-item--${TAXI}"]`).should('be.visible')
    shot('C30-treeview')
  })

  it("C31 — arbre filtré", () => {
    // La v4 ne charge les collections d'un index qu'à son ouverture : sans
    // elle, le filtre ne trouve pas `yellow-taxi`.
    openApp(`/data/${TAXI_INDEX}`)
    cy.get('[data-cy="Treeview-filter"]').type('taxi')
    cy.get(`[data-cy="Treeview-item--${TAXI}"]`).should('be.visible')
    shot('C31-treeview-filter')
  })

  it('C32 — liste des index', () => {
    openApp('/data')
    cy.get(`[data-cy="IndexesPage-name--${TAXI_INDEX}"]`).should('be.visible')
    shot('C32-indexes')
  })

  it('C33 — liste des index, filtre sans résultat', () => {
    openApp('/data')
    pick('[data-cy="IndexesPage-filter"]', '.IndexesPage input[type="search"]', '.IndexesPage input[type="text"]')
      .type('zzz')
    cy.contains('There is no index matching your filter')
    shot('C33-indexes-filter-empty')
  })

  it("C34 — modale de création d'index, nom invalide", () => {
    openApp('/data')
    cy.get('[data-cy="IndexesPage-createBtn"]').click()
    cy.get('[data-cy="CreateIndexModal-name"]').type('Bad Name')
    cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
    shot('C34-create-index-modal')
  })

  it("C35 — modale de suppression d'index", () => {
    openApp('/data')
    cy.get('[data-cy="IndexesPage-delete--empty-index"]').click()
    cy.get('[data-cy="DeleteIndexModal-name"]').should('be.visible')
    shot('C35-delete-index-modal')
  })

  it("C36 — suppression groupée d'index", () => {
    openApp('/data')
    cy.get('[data-cy="IndexesPage-checkbox--empty-index"]').click({ force: true })
    cy.get(`[data-cy="IndexesPage-checkbox--${IOT_INDEX}"]`).click({ force: true })
    cy.get('[data-cy="IndexesPage-bulkDelete--btn"]').click()
    cy.get('[data-cy="BulkDeleteIndexModal-input-confirmation"]').should('be.visible')
    shot('C36-bulk-delete-indexes-modal')
  })

  // 6–7. Collections
  it('C40 — liste des collections', () => {
    openApp(`/data/${TAXI_INDEX}`)
    cy.get(`[data-cy="CollectionList-name--${TAXI}"]`).should('be.visible')
    shot('C40-collections')
  })

  it('C41 — modale de suppression de collection', () => {
    openApp(`/data/${TAXI_INDEX}`)
    cy.get('[data-cy="CollectionList-delete--drivers"]').click()
    cy.get('[data-cy="DeleteCollectionModal-confirm"]').should('be.visible')
    shot('C41-delete-collection-modal')
  })

  it('C42 — suppression groupée de collections', () => {
    openApp(`/data/${TAXI_INDEX}`)
    cy.get('[data-cy="CollectionList-checkbox--drivers"]').click({ force: true })
    cy.get(`[data-cy="CollectionList-checkbox--${ZONES}"]`).click({ force: true })
    cy.get('[data-cy="CollectionList-bulkDelete--btn"]').click()
    cy.get('[data-cy="BulkDeleteCollectionsModal-input-confirmation"]').should('be.visible')
    shot('C42-bulk-delete-collections-modal')
  })

  it("C43 — menu de l'index", () => {
    openApp(`/data/${TAXI_INDEX}`)
    cy.get('[data-cy="IndexDropdownAction"]').click()
    cy.get('[data-cy="IndexDropdown-delete"]').should('be.visible')
    shot('C43-index-dropdown')
  })

  it("C44 — création de collection", () => {
    openApp(`/data/${TAXI_INDEX}/create`)
    cy.get('[data-cy="CollectionCreateOrUpdate-name"]').should('be.visible')
    shot('C44-create-collection')
  })

  it("C45 — édition de collection", () => {
    openApp(`/data/${TAXI_INDEX}/${TAXI}/edit`)
    cy.get('[data-cy="export-collection-mapping"]').should('be.visible')
    shot('C45-edit-collection')
  })

  // 8. Documents
  const docsPath = `/data/${TAXI_INDEX}/${TAXI}`

  it('C50 — documents, vue liste', () => {
    setListView(TAXI_INDEX, TAXI, 'list')
    openApp(docsPath)
    documentItem('taxi-001').should('be.visible')
    shot('C50-documents-list')
  })

  it('C51 — menu View', () => {
    openApp(docsPath)
    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.get('[data-cy="CollectionDropdown-map"]').should('be.visible')
    shot('C51-view-dropdown')
  })

  it("C52 — menu d'actions de la collection", () => {
    openApp(docsPath)
    cy.get('[data-cy="CollectionDropdownAction"]').click()
    cy.get('[data-cy="CollectionDropdown-clear"]').should('be.visible')
    shot('C52-collection-dropdown')
  })

  it('C53 — modale Clear', () => {
    openApp(docsPath)
    cy.get('[data-cy="CollectionDropdownAction"]').click()
    cy.get('[data-cy="CollectionDropdown-clear"]').click()
    cy.get('[data-cy="CollectionClearModal-collectionName"]').should('be.visible')
    shot('C53-clear-modal')
  })

  it('C54 — menu Refresh / Auto-Sync', () => {
    openApp(docsPath)
    pick('[data-cy="Refresh-dropdown--toggle"]', '[data-cy="Refresh-dropdown"] .dropdown-toggle').click()
    cy.get('[data-cy="Autosync-toggle"]').should('be.visible')
    shot('C54-refresh-dropdown')
  })

  it('C55 — documents, aucun résultat', () => {
    openApp(docsPath)
    cy.get('[data-cy="QuickFilter-input"]').type('zzzzzz{enter}')
    cy.get('[data-cy="DocumentsEmptyState"]').should('be.visible')
    shot('C55-documents-empty')
  })

  // La quick search (`phrase_prefix` sur `*`) ne trouve que dans les champs
  // texte : `notes` (« Airport run » sur taxi-001, 006, 011…), pas `vendor`.
  it('C56 — quick search active', () => {
    setListView(TAXI_INDEX, TAXI, 'list')
    openApp(docsPath)
    documentItem('taxi-002').should('be.visible')
    cy.get('[data-cy="QuickFilter-input"]').type('Airport{enter}')
    documentItem('taxi-006').should('be.visible')
    cy.get('[data-cy="DocumentListItem-taxi-002"], [data-cy="DocumentListItem--taxi-002"]').should('not.exist')
    shot('C56-quick-search')
  })

  it('C57 — filtre avancé', () => {
    openApp(docsPath)
    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="BasicFilter-submitBtn"]').should('be.visible')
    shot('C57-basic-filter')
  })

  it('C58 — filtre JSON', () => {
    openApp(docsPath)
    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-rawTab"]').click()
    cy.get('[data-cy="RawFilter-submitBtn"]').should('be.visible')
    shot('C58-raw-filter')
  })

  it('C59 — historique des filtres', () => {
    openApp(docsPath)
    cy.get('[data-cy="QuickFilter-input"]').type('Street{enter}')
    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-historyTab"]').click()
    cy.get('[data-cy^="FilterHistoryItem--"]').should('exist')
    shot('C59-filter-history')
  })

  it('C60 — filtres enregistrés', () => {
    openApp(docsPath)
    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-favoriteTab"]').click()
    cy.contains("You don't have any favorite filters")
    shot('C60-filter-favorites')
  })

  it('C61 — filtres en plein écran', () => {
    openApp(docsPath)
    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    cy.get('[data-cy="Filters-fullscreen"]').click()
    shot('C61-filters-fullscreen')
  })

  it('C62 — vue liste, document déplié', () => {
    setListView(TAXI_INDEX, TAXI, 'list')
    openApp(docsPath)
    documentItem('taxi-001')
      .find('[data-cy="DocumentListItem-toggleCollapse"]')
      .click()
    shot('C62-list-expanded')
  })

  it('C63 — modale de suppression de document', () => {
    setListView(TAXI_INDEX, TAXI, 'list')
    openApp(docsPath)
    cy.get('[data-cy="DocumentListItem-delete--taxi-001"]').click()
    cy.contains('Document deletion').should('be.visible')
    shot('C63-delete-document-modal')
  })

  it('C64 — vue colonnes', () => {
    setListView(TAXI_INDEX, TAXI, 'column')
    openApp(docsPath)
    cy.get('[data-cy="DocumentList-Column"]').should('be.visible')
    shot('C64-column-view')
  })

  it('C65 — export CSV', () => {
    setListView(TAXI_INDEX, TAXI, 'column')
    openApp(docsPath)
    cy.get('[data-cy="Column-btnExportCSV"]').click()
    cy.contains(/Download|Preparing download/)
    shot('C65-csv-export')
  })

  const chartPath = `/data/${IOT_INDEX}/${MEASURES}`

  it('C67 — vue graphique, aucun champ choisi', () => {
    openApp(chartPath)
    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.get('[data-cy="CollectionDropdown-TimeSeries"]').click()
    cy.get('[data-cy="TimeSeriesView-container"]').should('be.visible')
    shot('C67-chart-empty')
  })

  it('C66 — vue graphique, deux séries', () => {
    openApp(chartPath)
    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.get('[data-cy="CollectionDropdown-TimeSeries"]').click()
    cy.get('[data-cy="TimeSeriesView-container"]').should('be.visible')
    ;['temperature', 'humidity'].forEach(field => {
      cy.get('[data-cy="timeSeries-item"]').click()
      cy.get(`[data-cy="autocomplete-item--${field}"]`).click()
    })
    cy.get('[data-cy="timeSeries-chart"]').should('be.visible')
    shot('C66-chart')
  })

  it('C68 — vue carte', () => {
    openApp(docsPath)
    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.get('[data-cy="CollectionDropdown-map"]').click()
    cy.get('[data-cy="mapView-map"]').should('be.visible')
    cy.get('.leaflet-marker-icon').should('have.length.greaterThan', 0)
    shot('C68-map-view')
  })

  it('C69 — vue carte, document sélectionné', () => {
    openApp(docsPath)
    cy.get('[data-cy="CollectionDropdownView"]').click()
    cy.get('[data-cy="CollectionDropdown-map"]').click()
    cy.get('.leaflet-marker-icon').first().click({ force: true })
    cy.get('[data-cy="mapView-current-document-card"]').should('be.visible')
    shot('C69-map-selected')
  })

  // 9. Formulaire de document
  it('C70 — création de document, JSON', () => {
    openApp(`${docsPath}/create`)
    cy.get('[data-cy="DocumentCreate-input--id"]').should('be.visible')
    shot('C70-create-document')
  })

  it('C71 — création de document, formulaire', () => {
    openApp(`${docsPath}/create`)
    cy.get('[data-cy="formView-switch"]').click({ force: true })
    shot('C71-create-document-form')
  })

  // 10. Temps réel
  const watchPath = `${docsPath}/watch`

  it('C80 — Watch, non abonné', () => {
    openApp(watchPath)
    cy.get('[data-cy="Watch-subscribeBtn"]').should('be.visible')
    shot('C80-watch')
  })

  it('C81 — Watch, filtres visibles', () => {
    openApp(watchPath)
    cy.get('[data-cy="Watch-toggleFiltersBtn"]').click()
    shot('C81-watch-filters')
  })

  it('C82 — Watch, notifications reçues', () => {
    openApp(watchPath)
    cy.get('[data-cy="Watch-subscribeBtn"]').click()
    cy.contains('Waiting for notifications')
    cy.request('POST', `${kuzzleUrl}/${TAXI_INDEX}/${TAXI}/_publish`, { vendor: 'CMT', fare_amount: 12 })
    cy.request('POST', `${kuzzleUrl}/${TAXI_INDEX}/${TAXI}/watch-doc/_create`, { vendor: 'VTS' })
    cy.request('DELETE', `${kuzzleUrl}/${TAXI_INDEX}/${TAXI}/watch-doc`)
    cy.get('[data-cy="Notification"]').should('have.length', 3)
    cy.get('[data-cy="Notification-header"]').first().click()
    shot('C82-watch-notifications')
  })

  // 11. Utilisateurs
  it('C90 — liste des utilisateurs', () => {
    openApp('/security/users')
    cy.get('[data-cy="UserItem-alice--toggle"]').should('be.visible')
    shot('C90-users')
  })

  it('C91 — utilisateurs, recherche avancée', () => {
    openApp('/security/users')
    cy.get('[data-cy="QuickFilter-optionBtn"]').click()
    shot('C91-users-advanced-search')
  })

  it('C92 — utilisateurs, suppression groupée', () => {
    openApp('/security/users')
    cy.get('[data-cy="UserListItem-checkbox--alice"]').click({ force: true })
    cy.get('[data-cy="UserListItem-checkbox--carol"]').click({ force: true })
    cy.get('[data-cy="UserList-bulkDeleteBtn"]').click()
    cy.get('[data-cy="ModalDeleteUsers-submitBtn"]').should('be.visible')
    shot('C92-users-bulk-delete')
  })

  it("C93 — édition d'utilisateur, Basic", () => {
    openApp('/security/users/bob')
    cy.get('[data-cy="UserBasic-kuid"]').should('exist')
    shot('C93-user-basic')
  })

  it("C94 — création d'utilisateur, credentials", () => {
    openApp('/security/users/create')
    cy.get('[data-cy="CredentialsSelector-local-username"]').should('exist')
    shot('C94-user-credentials')
  })

  it("C95 — édition d'utilisateur, Custom", () => {
    openApp('/security/users/bob')
    cy.get('[data-cy="UserUpdate-customTab"]').click()
    cy.get('[data-cy="UserCustomContent-jsonEditor"]').should('be.visible')
    shot('C95-user-custom')
  })

  it('C96 — mapping des utilisateurs', () => {
    openApp('/security/users/custom-mapping')
    cy.get('[data-cy="EditUserMapping-JSONEditor"]').should('be.visible')
    shot('C96-users-mapping')
  })

  // 12. Profils
  it('C100 — liste des profils', () => {
    openApp('/security/profiles')
    cy.get('[data-cy="ProfileItem-reader--toggle"]').should('be.visible')
    shot('C100-profiles')
  })

  it('C101 — profils, filtre par rôle', () => {
    openApp('/security/profiles')
    cy.get('[data-cy="ProfileFilters-roleSelect"]').click()
    shot('C101-profiles-filter')
  })

  it('C102 — profils, suppression groupée', () => {
    openApp('/security/profiles')
    cy.get('[data-cy="ProfileListItem-checkbox--reader"]').click({ force: true })
    cy.get('[data-cy="ProfileListItem-checkbox--writer"]').click({ force: true })
    cy.get('[data-cy="ProfileList-bulkDeleteBtn"]').click()
    cy.get('[data-cy="ModalDeleteProfiles-submitBtn"]').should('be.visible')
    shot('C102-profiles-bulk-delete')
  })

  it('C103 — création de profil', () => {
    openApp('/security/profiles/create')
    cy.get('[data-cy="ProfileCreateOrUpdate-id"]').should('be.visible')
    shot('C103-create-profile')
  })

  it('C104 — édition de profil', () => {
    openApp('/security/profiles/reader')
    cy.get('[data-cy="ProfileCreateOrUpdate-updateBtn"]').should('be.visible')
    shot('C104-edit-profile')
  })

  // 13. Rôles
  it('C110 — liste des rôles', () => {
    openApp('/security/roles')
    cy.get('[data-cy="RoleItem-data-reader--toggle"]').should('be.visible')
    shot('C110-roles')
  })

  it('C111 — rôles, filtre par contrôleur', () => {
    openApp('/security/roles')
    cy.get('[data-cy="RoleFilters-searchBar"]').click()
    shot('C111-roles-filter')
  })

  it('C112 — rôles, suppression groupée', () => {
    openApp('/security/roles')
    cy.get('[data-cy="RoleItem-checkbox--data-reader"]').click({ force: true })
    cy.get('[data-cy="RoleItem-checkbox--ops"]').click({ force: true })
    cy.get('[data-cy="UserList-bulkDeleteBtn"]').click()
    cy.get('[data-cy="ModalDeleteRoles-submitBtn"]').should('be.visible')
    shot('C112-roles-bulk-delete')
  })

  it('C113 — Revoke anonymous rights', () => {
    openApp('/security/roles')
    cy.get('[data-cy="RolesManagement-revokeAnonymous"]').should('be.visible')
    shot('C113-revoke-anonymous')
  })

  it('C114 — création de rôle', () => {
    openApp('/security/roles/create')
    cy.get('[data-cy="RoleCreateOrUpdate-id"]').should('be.visible')
    shot('C114-create-role')
  })

  // 14. API Action
  it('C120 — API Action', () => {
    openApp('/api-action')
    cy.get('[data-cy="api-actions-controller-input-0"]').should('be.visible')
    shot('C120-api-action')
  })


  it('C122 — API Action, réponse', () => {
    openApp('/api-action')
    cy.get('[data-cy="api-actions-controller-input-0"]').type('server')
    cy.get('[data-cy="api-actions-action-input-0"]').type('now')
    cy.get('[data-cy="api-actions-run-button-0"]').click()
    cy.get('[data-cy="api-actions-response-status-0"]').should('contain', '200')
    shot('C122-api-action-response')
  })

  it('C123 — API Action, enregistrer', () => {
    openApp('/api-action')
    cy.get('[data-cy="api-actions-controller-input-0"]').type('server')
    cy.get('[data-cy="api-actions-action-input-0"]').type('now')
    cy.get('[data-cy="api-actions-save-button-0"]').click()
    cy.get('[data-cy="api-actions-modal-name-input"]').should('be.visible')
    shot('C123-api-action-save')
  })

  // En dernier : il crée un admin puis réinitialise la sécurité, ce qui
  // défait le jeu de données des états précédents.
  it('C15 — session expirée', () => {
    cy.request('POST', `${kuzzleUrl}/_createFirstAdmin?_id=admin`, {
      content: {},
      credentials: { local: { username: 'admin', password: 'password' } },
    })
    cy.request('POST', `${kuzzleUrl}/_login/local`, {
      username: 'admin',
      password: 'password',
    }).then(({ body }) => {
      openApp('/data', { token: body.result.jwt })
      cy.get('[data-cy="IndexesPage-createBtn"]').should('be.visible')
      cy.request('POST', `${kuzzleUrl}/admin/_resetSecurity`)
      cy.get('[data-cy="IndexesPage-createBtn"]').click()
      cy.get('[data-cy="CreateIndexModal-name"]').type('newindex')
      cy.get('[data-cy="CreateIndexModal-createBtn"]').click()
      cy.contains('Sorry, your session has expired')
      shot('C15-session-expired')
    })
  })
})
