# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers building applications on Kuzzle. They open the console while they
develop and debug, most often against a local or staging stack, to look at what
the backend actually holds and does: indexes, collections and their mappings,
documents, real-time notifications, users, profiles and roles. They already
know Kuzzle's vocabulary and API; they come to check, fix or try something, then
go back to their code.

## Product Purpose

The Kuzzle Admin Console is a web application that connects to one or several
Kuzzle instances and lets a developer manage their data, real-time
subscriptions and security without writing API calls by hand. Success is a
developer who finds, reads and changes backend state faster than with the raw
API, and trusts that what the console shows is what Kuzzle holds.

## Positioning

It is Kuzzle's own console: it speaks the platform's concepts directly (index,
collection, mapping, document, Koncorde filter, controller/action, role,
profile, credentials strategy) and supports both Kuzzle v1 and v2 backends
through the two SDKs (ADR-0005). A generic Elasticsearch or database browser
cannot show Kuzzle's security model or its real-time layer.

## Operating Context

- The console runs in the browser and connects to a Kuzzle host and port
  (default 7512) that the user declares as a "connection" (environment). Several
  connections can be saved and switched.
- Hosted at console.kuzzle.io, shipped as the `kuzzleio/admin-console` Docker
  image, or built locally. The modernised v5 is deployed on console-v5.kuzzle.io
  and the v4 staging on next-console.kuzzle.io.
- Sessions start with login (or anonymous access when the backend allows it),
  and a first-admin signup on a fresh backend.

## Capabilities and Constraints

- **Connections**: create, edit, select, import/export environments.
- **Data**: indexes list, collections list, collection create/edit (mapping,
  dynamic policy, realtime-only), document list (list, column, map and time-series views),
  search with quick, basic and raw filters plus filter history and favourites, document create/update in form or
  JSON view, bulk delete, watch a collection's real-time notifications.
- **Security**: users (list, create, update, custom mapping, credentials),
  profiles and roles (list, create, update as JSON).
- **API Action**: a query runner for any controller/action, with saved queries.
- UI language is **English**; there is no i18n today.
- Dense lists, a JSON editor, a filter builder, map and chart views: the heavy
  screens are data-dense by nature.
- The 17 Cypress specs are the only safety net; `data-cy` attributes anchor them
  and must survive any redesign.

## Brand Commitments

- The Kuzzle product design system is binding for the look of the console:
  palette, typography, radii, elevation and generic components
  ([ADR-0043](docs/adr/0043-da-kuzzle-pour-la-console.md), `DESIGN.md`).
  The IoT-specific vocabulary (measure pills, KHero, soft-tenants) does not
  apply.
- Voice: precise, functional, short labels. Identifiers, values and JSON in
  monospace. No emoji in the product UI. Icons are Font Awesome.
- Kuzzle logos are in `src/assets/` (`logo.svg`, `logo-white.svg` and
  horizontal/vertical PNGs).

## Evidence on Hand

- `README.md` and `docs/MIGRATION.md` describe the product and its ongoing
  modernisation; `docs/adr/` records why each choice was made.
- `docs/design-system/` holds a frozen copy of the Kuzzle design-system tokens.
- No user research, analytics or usage metrics are on hand. Future work must
  not invent them.

## Product Principles

1. **Show what the backend holds.** The console is trusted only if what it
   displays matches Kuzzle exactly; no silent reformatting of data.
2. **Density over decoration.** Developers scan lists and JSON; every pixel of
   chrome must earn its place against content.
3. **Kuzzle's vocabulary, not a new one.** Screens name things the way the API
   and the documentation do.
4. **Don't break the safety net.** A redesign keeps behaviour and `data-cy`
   anchors intact; a failing spec means the change is wrong.
