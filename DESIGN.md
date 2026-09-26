---
name: Kuzzle Admin Console
description: The Kuzzle product design system, applied to a data-dense developer console.
colors:
  kuzzle-blue: "#002835"
  fuchsia: "#E64472"
  fuchsia-deep: "#C93960"
  captain-blue: "#00536F"
  soft-sky: "#DAEDF6"
  teal: "#379FAB"
  page-mist: "#F6F7FB"
  panel-grey: "#EEF1F5"
  table-head: "#F9FAFD"
  row-hover: "#EEF4F8"
  hairline: "#D0DDE1"
  label-slate: "#43565B"
  muted-slate: "#6C757D"
  white: "#FFFFFF"
  success: "#3DDC84"
  warning: "#C9821F"
  danger: "#DC3545"
typography:
  display:
    fontFamily: "Gobold, Oswald, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.15
  title:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.55
  ui:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.07em"
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  field: "4px"
  control: "6px"
  hero: "8px"
  panel: "12px"
  pill: "20px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
components:
  button-primary:
    backgroundColor: "{colors.fuchsia}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.fuchsia-deep}"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.kuzzle-blue}"
    rounded: "{rounded.control}"
    height: "36px"
  button-destructive:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.kuzzle-blue}"
    rounded: "{rounded.field}"
    height: "36px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "16px"
  badge-count:
    backgroundColor: "{colors.fuchsia}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
  tag:
    backgroundColor: "{colors.soft-sky}"
    textColor: "{colors.kuzzle-blue}"
    rounded: "{rounded.pill}"
  nav-rail:
    backgroundColor: "{colors.kuzzle-blue}"
    textColor: "{colors.white}"
  nav-item-active:
    backgroundColor: "{colors.fuchsia}"
    textColor: "{colors.white}"
  table-header:
    backgroundColor: "{colors.table-head}"
    textColor: "{colors.kuzzle-blue}"
---

# Design System: Kuzzle Admin Console

> **Source.** This file transposes the Kuzzle product design system
> ([Claude Design project](https://claude.ai/design/p/243f828d-6dce-4f59-8546-e00feeb60eb8?file=Kuzzle+Design+System.dc.html),
> frozen copy of its tokens in [`docs/design-system/`](docs/design-system/)) to
> the console. The decision, and what is deliberately left out, is in
> [ADR-0043](docs/adr/0043-da-kuzzle-pour-la-console.md).
>
> **State on 2026-09-26: fonts, colors, radii, shadows and motion are
> applied; the rest is still the target.** `src/assets/tokens.css` carries
> them and the fonts are served by the console (ADR-0047). The type scale,
> the component details below and the layout (navigation rail, page headers)
> are not applied yet.
>
> **Two vocabularies.** The frontmatter keeps the design system's names. The
> console consumes shadcn-vue tokens (`--primary`, `--muted`, `--border`…,
> ADR-0003); the mapping is the table in *Colors* below. Components use the
> shadcn-vue names, never the hex values.

## Overview

**Creative North Star: "The Instrument Panel"**

A calm, light workbench where the backend's data is the loudest thing on
screen. Content sits on white cards over a cool, barely-blue page. One deep
Kuzzle blue anchors the chrome (navigation rail, tooltips, strong text), and a
single fuchsia marks what is actionable or active. Everything else is hairlines,
slate labels and monospace values.

The console is an Operate surface for developers: lists of documents, JSON,
mappings, roles. Density is a feature. Brand lives in precise details (the
fuchsia filet on top of a card, the caps labels, the Montserrat section titles),
not in large decorative surfaces.

The design system comes from the Kuzzle IoT application. The console takes its
foundations and generic components. The IoT vocabulary (measure pills, the
KHero entity header, soft-tenant tags, asset/device/group skeleton) does not
apply here.

**Key Characteristics:**

- Light canvas (`#F6F7FB`), white cards, cool-tinted shadows: never pure black.
- One accent, fuchsia `#E64472`, for CTAs, active navigation and tabs, links
  and selection.
- Deep Kuzzle blue `#002835` for the navigation rail, tooltips and strong text.
- Ubuntu for everything you read, Montserrat 800 for section titles, Gobold
  caps for the rare display title.
- Identifiers, values and JSON in monospace.

## Colors

A cool, low-chroma neutral world with one warm, saturated accent.

### Primary

- **Kuzzle Fuchsia** (`#E64472`): primary buttons, active navigation item,
  active tab underline, selected segment, links, checkbox and switch "on",
  count badges. Hover and pressed: **Fuchsia Deep** (`#C93960`).

### Secondary

- **Kuzzle Blue** (`#002835`): body text and strong text, the navigation rail,
  tooltips, dark code surfaces (JSON viewer).
- **Captain Blue** (`#00536F`): focus border, icons and markers on light
  backgrounds.

### Tertiary

- **Soft Sky** (`#DAEDF6`): tags, soft fills, the icon tile of stat cards.
- **Teal** (`#379FAB`): secondary accent for grouping; used sparingly.

### Neutral

- **Page Mist** (`#F6F7FB`): application background.
- **White** (`#FFFFFF`): cards, popovers, dialogs, inputs.
- **Panel Grey** (`#EEF1F5`): panels grouping several cards, muted surfaces.
- **Table Head** (`#F9FAFD`): table headers, disabled fields.
- **Row Hover** (`#EEF4F8`): table row and menu item hover.
- **Hairline** (`#D0DDE1`): borders, dividers, input strokes.
- **Label Slate** (`#43565B`): caps field labels.
- **Muted Slate** (`#6C757D`): secondary text, placeholders, help text.

### State

- **Success** (`#3DDC84`), **Warning** (`#C9821F`), **Danger** (`#DC3545`).
  Danger is distinct from the fuchsia accent: a delete button must never read as
  a primary action.

### Mapping to the console's tokens (`src/assets/tokens.css`)

| Console token | Value | Design-system source |
|---|---|---|
| `--background` | `#F6F7FB` | `--body` |
| `--foreground` | `#002835` | `--secondary` |
| `--card` / `--popover` | `#FFFFFF` | `--surface-card` |
| `--card-foreground` / `--popover-foreground` | `#002835` | `--text-strong` |
| `--primary` | `#E64472` | `--primary` |
| `--primary-foreground` | `#FFFFFF` | — |
| `--secondary` | `#DAEDF6` | `--tertiary` |
| `--secondary-foreground` | `#002835` | `--secondary` |
| `--accent` | `#EEF4F8` | table row hover |
| `--accent-foreground` | `#002835` | `--secondary` |
| `--muted` | `#EEF1F5` | `--panel` |
| `--muted-foreground` | `#6C757D` | `--secondary-light` |
| `--destructive` | `#DC3545` | `--status-danger` |
| `--border` / `--input` | `#D0DDE1` | `--grey-bright` |
| `--ring` | `#00536F` | `--secondary-captain` |

The console adds tokens that shadcn-vue does not have, because it needs them:

| Console token | Value | Design-system source |
|---|---|---|
| `--primary-hover` | `#C93960` | `--primary-dark` |
| `--label` | `#43565B` | `--grey` |
| `--success` / `--success-foreground` | `#3DDC84` / `#002835` | `--status-success` |
| `--warning` / `--warning-foreground` | `#C9821F` / `#002835` | `--status-warning` |
| `--info` / `--info-foreground` | `#00536F` / `#FFFFFF` | `--secondary-captain` (no info color in the DS) |

Success and warning carry Kuzzle Blue text, not white: white on either fails
the 4.5:1 contrast ratio.

The v4 palette mapped `--primary` to Kuzzle Blue and `--destructive` to a pink
(`#E94E77`) almost identical to the new accent. Both move together in the DA
lot; a component that used `destructive` to mean "pink" must be caught there.

### Named Rules

**The One Accent Rule.** Fuchsia is the only saturated color in the chrome. If
two different things on a screen are fuchsia, one of them is wrong.

**The Danger Is Not Pink Rule.** Destructive actions use Danger `#DC3545`, never
the accent.

## Typography

**Display Font:** Gobold (with Oswald, then sans-serif)
**Heading Font:** Montserrat 800
**Body Font:** Ubuntu (400, 500, 700)
**Mono Font:** ui-monospace, SF Mono, Menlo, Consolas

**Character:** Ubuntu is friendly and legible at small sizes for dense rows;
Montserrat's heavy section titles give structure; Gobold's condensed caps are
Kuzzle's brand voice, used once per screen at most.

### Hierarchy

- **Display** (Gobold 700, 40px, line-height 1, uppercase, +0.01em): page-level
  brand titles only (login, first-admin signup, empty states). Rare.
- **Headline** (Montserrat 800, 26px, 1.15): page and section titles
  ("Indexes", "Users").
- **Title** (Ubuntu 700, 16px, 1.15): card and dialog titles.
- **Body** (Ubuntu 400, 14.5px, 1.55): paragraphs, descriptions.
- **UI** (Ubuntu 400, 13.5px): controls, table rows, menus.
- **Small** (Ubuntu 400, 12.5px): help text, metadata, validation messages.
- **Label** (Ubuntu 700, 11px, +0.07em, UPPERCASE, Label Slate): field labels,
  eyebrows above a title, table section labels.
- **Mono** (13px): IDs, index and collection names in content, values, JSON.

### Named Rules

**The Mono For Data Rule.** Anything that comes from the backend verbatim (an
`_id`, a field name, a value, a JSON body) is monospace. UI copy never is.

**The Sentence Case Rule.** Content and buttons are sentence case; only field
labels, eyebrows and the display title are caps. Casing comes from CSS
(`uppercase`), never from typing the string in capitals: the DOM text stays
what the specs and screen readers expect.

## Layout

- Base spacing unit 4px; steps 4, 8, 12, 16, 24, 32, 48.
- Content area on the Page Mist background; cards separated by 16–24px.
- Content width is fluid: document lists and JSON use the width they get. The
  design system's ~1200px cap applies to forms and detail pages only.
- Page actions (create, refresh, overflow menu) sit top-right of the page
  header. Row actions appear on row hover and on keyboard focus.
- **Navigation, target:** a collapsible dark left rail (Kuzzle Blue) with Data,
  Security and API Action. The current top navbar stays until the layout lot;
  moving it is a layout change, not a token change.

## Elevation & Depth

Layered and lifted, softly: every shadow is tinted with Kuzzle Blue.

### Shadow Vocabulary

- **Card** (`0 1px 3px rgba(0,40,53,.09)`): cards at rest.
- **Signature** (`inset 0 1px 0 0 #E64472, 0 1px 3px rgba(0,40,53,.09)`): a card
  with the fuchsia top filet; the most recognisable Kuzzle surface.
- **Hover** (`0 12px 28px -12px rgba(0,40,53,.28)`): lifted interactive card.
- **Menu** (`0 18px 44px -12px rgba(10,28,41,.4)`): dropdowns, selects,
  popovers.
- **Modal** (`0 30px 60px -20px rgba(10,28,41,.55)`): dialogs.
- **Tooltip** (`0 24px 46px -18px rgba(0,20,28,.7)`): dark tooltips.
- **Focus ring** (`0 0 0 3px rgba(0,83,111,.1)`) with a Captain Blue border.

### Named Rules

**The Cool Shadow Rule.** No `rgba(0,0,0,…)` shadows. Depth is always tinted
with the brand blue.

**The Lift Without Shift Rule.** Hover lift and the filet thickening (1px → 3px)
are drawn with `box-shadow` and `transform`, never with borders or margins, so
the layout never moves.

## Shapes

- Fields 4px, buttons and cards 6px, large panels and hero areas 8px, outer
  containers 12px, pills and tags 20px (fully rounded at their height).
- Borders are 1px Hairline. No double borders: a card inside a panel has a
  shadow, not a border.

In `tokens.css`, the Tailwind scale carries these values: `rounded-sm` is the
field (4px), `rounded-md` the control and card (6px), `rounded-lg` the dialog
and hero (8px), `rounded-xl` the panel (12px), `rounded-pill` the badge and
tag (20px). Shadows are `shadow-card`, `shadow-hover`, `shadow-menu`,
`shadow-modal`, `shadow-tooltip` and `shadow-signature`; transitions default
to 160ms.

## Components

### Buttons

Confident, compact, one primary per area.

- **Shape:** 6px radius, 36px tall (32px for small), 12–16px horizontal
  padding, Ubuntu 500 13.5px, optional 12px leading icon.
- **Primary** (`variant="default"`): Fuchsia fill, white text; hover Fuchsia
  Deep.
- **Outline** (`variant="outline"`): white, Hairline border, Kuzzle Blue text;
  hover Row Hover background. The neutral button ("Cancel", "Show map").
- **Secondary** (`variant="secondary"`): Soft Sky fill, Kuzzle Blue text.
- **Ghost** (`variant="ghost"`): transparent, Row Hover on hover; icon buttons
  in toolbars and rows.
- **Destructive** (`variant="destructive"`): Danger fill, white text. In dense
  rows, a ghost button with Danger text and a trash icon.
- **Link** (`variant="link"`): Fuchsia text, underline on hover.
- **Focus:** Captain Blue focus ring, visible on keyboard focus only.

### Badges and tags

- **Count badge:** Fuchsia pill, white 12px bold (notification counters).
- **Tag:** Soft Sky pill, Kuzzle Blue text (profiles on a user, tags in inputs).
- **Status:** tinted pill with a leading dot (Success for "online", neutral grey
  for "offline").

### Cards / Containers

- **Corner Style:** 6px.
- **Background:** White on Page Mist; groups of cards may sit on a Panel Grey
  panel with 16px padding.
- **Shadow Strategy:** Card at rest; Signature for primary content cards;
  Hover lift only if the whole card is clickable.
- **Internal Padding:** 16px (24px for forms).

### Inputs / Fields

- **Style:** White, 1px Hairline, 4px radius, 36px tall, Ubuntu 13.5px;
  placeholder Muted Slate. Label above in Label style.
- **Focus:** Captain Blue border plus the focus ring.
- **Error:** Danger border, 12px Danger message below.
- **Disabled:** Table Head background, Muted Slate text.
- **Switch:** Success green when on (design-system sample); **checkbox:** Fuchsia
  when checked.

### Tables

- Header on Table Head, Ubuntu 700 13px, sortable columns with a chevron;
  rows 1px Hairline apart; hover Row Hover (160ms); monospace for data cells;
  row actions revealed on hover and focus. Pagination: bordered square buttons,
  active page Fuchsia.

### Tabs and segmented control

- **Tabs:** text tabs, active tab Fuchsia text with a 2px Fuchsia underline;
  inactive Muted Slate.
- **Segmented control:** bordered group, selected segment Fuchsia fill with
  white text (e.g. "Form / JSON").

### Navigation

- **Rail (target):** Kuzzle Blue background, white Ubuntu 500 items with a
  Font Awesome icon; hover `rgba(230,68,114,.22)` plus a 3px inset Fuchsia bar
  on the left; active item full Fuchsia bar, white bold text. Sub-menus indent
  on a darker band. Opens after a 350ms hover delay and expands over 700ms
  `cubic-bezier(.22,1,.36,1)`.

### Tooltip and JSON surfaces

- Dark Kuzzle Blue surface, white text, Tooltip shadow, 8px radius. JSON
  colouring: keys light blue, numbers fuchsia, strings green, `null` amber.

### Icons

- Font Awesome solid (the console ships `@fortawesome/fontawesome-free` 6.7.2).
  No emoji, no hand-drawn SVG in the UI.

## Do's and Don'ts

### Do:

- **Do** take every color, radius, shadow and font from `tokens.css` through
  its shadcn-vue name (`bg-primary`, `border-border`, `shadow-card`).
- **Do** keep one primary (Fuchsia) button per area; the others are outline or
  ghost.
- **Do** render backend data in monospace.
- **Do** keep every `data-cy` attribute when a component is restyled.

### Don't:

- **Don't** use pure black or grey shadows; use the tinted vocabulary.
- **Don't** use the accent for destructive actions.
- **Don't** import the IoT-only components (measure pills, KHero, soft-tenant
  tags) into the console.
- **Don't** hard-code a hex, a pixel radius or a shadow in a component (ADR-0003).
- **Don't** type labels in capitals to get caps: use `uppercase`.
