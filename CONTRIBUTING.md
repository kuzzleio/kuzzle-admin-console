# Coding organization

We follow the general Vuejs scaffolding for organizing our JS code.

## Components and pages

The `src/components` directory contains the files that constitute the UI of the application. The contents of this directory
are organized in sections, mimicking the menu hierarchy. Each section must contain a `Layout.vue` file, used as the entry-point
to it. Each subsection must contain a `Page.vue` file, used as the entry-point to it.

## Vuex

- Only use actions/store/getters in Vuex if your data have to be shared between sibling components (try to avoid using the store
  for parent-to-children communication).
- Vuex actions must be prefixed with a verb (doThing ...)
- Getters must be named after the data they get.

# Coding style-guides

## Javascript

We use ESLint to enforce coding style conventions. ESLint triggers errors at build whenever conventions are not respected. See also `.eslintrc.js`.

## CSS / Sass

This section is strongly inspired by https://kaliop.github.io/frontend-style-guide/2.0/css/

### Formatting

Follow the formatting style used by [Prettier](https://prettier.io/) (with default settings).

- Indent with 2 spaces
- One selector per line
- One line per declaration (`property: value;`)
- Always use `;` at the end of a declaration
- Prefer double quotes (`"hello"`), and quote attribute values (`input[type="text"]`)

```css
body {
  font-size: 0.8rem;
}

.selector,
.other[type='text'] {
  font-weight: bold;
  color: black;
}

@media (min-width: 768px) {
  .something {
    display: block;
    background-image: url('/assets/img/pattern.png');
  }
}
```

Recommended: install Prettier (`npm i -g prettier` or [install for your editor](https://prettier.io/docs/en/editors.html)) and use it to automatically reformat your CSS or Sass code.

### Comments

Prefer Sass comments

```css
/* A CSS comment (standard syntax) */
// A Sass comment (always removed from CSS output)
```

In Sass (SCSS) source files, prefer the Sass comment syntax, except for the top comment that describes each file.
CSS/SCSS file header

Start each CSS filewith a header comment using the following format: `/*! This is a header */.`

When minifying the CSS, these comments will not be removed, which doesn’t add much to the file’s weight but makes it easier to break the minified CSS into several lines.
Don’t repeat obvious information

```css
// The teaser’s title
.Teaser-title {
…
}
```

### Units: pixels, ems, etc.

It’s not always obvious which CSS units are best for what use cases. Here are some points of reference:

- Avoid physical units such as `cm` and `pt`
- Media queries: prefer `px` (over using `em`)
- `font-size`: use `rem`, `em` or `px`
- `line-height`: use a unitless ratio, e.g. `1.2`

```css
html {
  // should be 16 * 1.25 = 20px
  font-size: 125%;
}

body {
  font-size: 0.8rem;
  line-height: 1.4;
}

h1 {
  font-size: 1.6rem;
  line-height: 1.2;
}

@media (min-width: 1100px) {
  h1 {
    font-size: 2.4rem;
    line-height: 1.1;
  }
}
```

Viewport-relative units

- `1vw`is equal to 1% of the viewport width (`100vw`)
- `1vh` is equal to 1% of the viewport height (`100vh`), but it can be unreliable in mobile browsers

### Avoid `!important`

Adding `!important` to your declarations helps fixing specificity issues, but only in the very short term! Avoid it.
If you do use `!important` in your code, always write a comment explaining why.

```css
.MyComponent-inner {
  // The JS library we use forces a width in JavaScript,
  // but we really need a fluid width here!
  width: auto !important;
}
```

### Sass

We use the Sass preprocessor, with the SCSS syntax.
Sass files should have a `.scss` extension.

We use `node-sass` (via the Webpack `sass-loader`) to compile `.scss` files to CSS.

#### Variables and mixins

Use lowercase names with hyphens (not underscores), and follow an general-to-particular progression:

Global variables and mixins: `$type-name`, `@mixin some-name` must be declared in `src/assets/variables.scss/`

Variables and mixins specific to a component: must be declared inside the component-scoped stylesheets (see below).

#### Selector Nesting

Selector nesting is good but it makes your code more difficult to read. Avoid unnecessary nesting.

- Nest once if helpful, twice at most.
- Keep the resulting CSS selectors as short as possible.
- Do not overuse the `&` symbol.

#### Avoid composing class names

Do not use the `&` symbol to create a class name that extends the parent class:

```css
.Header {
  …
  &--dark {…}
  &-logo {…}
}
```

In this example, if a developer looks at the HTML code and wants to find the CSS code for the Header--dark or Header-logo classes, they won’t be able to find it in the codebase!

```css
// BAD: unnecessary nesting
.Header {
  .Header-top {
    .Header-logo {…}
  }
}
.Nav {
  ul {
    li {
      a {…}
    }
  }
}

// GOOD: limit nesting
.Header {
  …
}
.Header-top {
  …
}
.Header-logo {
  …
}
.Nav a {
  …
}
```

### Selectors

We use classes for selectors. We try to keep selectors short (ideally, just one class). We discourage defining selectors that go beyond 2 levels of depth (a state-variant and pseudo classes are not considered in depth-count).

Do not use the `#some-id` selector (because of [high specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)). If you really need to target an id, and cannot add a class, use the attribute selector: `[id="some-id"]`.

```css
// Bad selector: too specific!
#stream .tweet_header .author {…}

// Better selectors
.Tweet {…}
.Tweet-author {…}
.Tweet-author a {…}
.Tweet-retweetBtn {…}
.Tweet-retweetBtn[disabled] {…}

// And with Sass nesting...
.Tweet {
  .Tweet-retweetBtn {
    &[disabled]
  }
}
```

In addition to classes, you can use:

- Element selectors (`h2`, `.MainNav-item` `a`, etc.). But keep in mind that sometimes the element can change, for example a `<h2>` can be changed to a `<h3>`, a `<a>` to a `<button>`, etc.
- Attribute selectors, especially for dynamic states (`.MainNav a[disabled]`).
- Pseudo-classes (`:empty`, `:invalid`, …)

### Utility classes

Utilities are simple styles that can be used on any element to trigger some basic function (in a few lines of CSS at most).

- Write utility classes in `camelCase`, without a prefix.
- Avoid using many utility classes. They move a lot of the presentation logic into your HTML, and can hide that a component has dependencies (unlike mixins and variables).
- If you have several utility classes that work together, consider making a component-specific class.

```css
// Utility classes

.icon {
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
}

.visuallyHidden {
  position: absolute !important;
  clip: rect(1px, 1px, 1px, 1px);
}
```

### Styled Components

As Vuejs enables us to put stylesheets directly in components, we follow the convention that all component-specific styles _must_ be written in the component's `<style>` tag. Also, component-specific styles must be `scoped`.

Also, remember you can access Sass variables declared in `src/assets/variables.scss` in component-scoped stylesheets.

```html
<style lang="sass" scoped>
  /* component styles... */
</style>
```

Each component must have a root element which contains the others (if any). Use the component’s name as its class, for example:

```html
<div class="Teaser">
  …
</div>
```

Class naming inside component-styles must be as semantic as possible, in order to properly differenciate utility classes and component-specific classes. E.g. avoid naming like `.pink-bg` inside a component: prefer `.unicorn-container` instead.

Component-specific classes should also be specifically named in order to avoid being accidentally applied gobally-defined styles. E.g. a class `.separator` in a `Breadcrumbs` component may be renamed to `.Breadcrumbs-separator` to avoid getting a possible `.separator` global class.

### Modifier classes

Sometimes the component’s container or a component element can have slightly different styles in different places. In those situations we can create style variants, using classes like: `Component--variantName` (for the container) or `Component-element--variantName` (for an element in the component).

```html
{# Alternative style for the first instance of this component in a list #}
<article class="Teaser Teaser--highlight">
  <h2 class="Teaser-head">
    <a href="…">…</a>
  </h2>
  <p class="Teaser-desc">…</p>
</article>

<article class="Teaser">
  <h2 class="Teaser-head">
    <a href="…">…</a>
  </h2>
  <p class="Teaser-desc">…</p>
</article>
```

### Responsive styles

We don't do very much responsive design in this project but we're likely to introduce it progressively.

#### Keep all styles for a selector together

Do not separate desktop and mobile styles into different files. You want to keep them tightly together:

```css
.spaceBefore1 {
  margin-top: 20px;
}
@media (min-width: 750px) {
  .spaceBefore1 {
    margin-top: 30px;
  }
}
```

#### Mobile-first

We may use a mobile-first approach. Here’s how it works:

- First, try to find the simpler “state” of a component or element style. Most of the time, it will look like the mobile layout.
- Then, add styles for larger viewports, in a media query.

Using Sass, you can use media query nesting to avoid repeating the selector and making the relationship between the styles clearer.

```css
.MyComponent {
  border: solid 1px black;
  padding: 10px;

  @media (min-width: 750px) {
    border-width: 5px;
    padding: 25px;
  }
}
```

Avoid doing things like this, it’s doing extra work for nothing:

```css
.MyComponent-image {
  float: left;
  margin-right: 20px;

  @media (max-width: 749px) {
    float: none;
    margin-right: 0;
  }
}
```

Finally, sometimes the mobile styles are rather specific and not useful for larger screens. In that case, try to separate styles in tree groups: common, small screens, and larger screens.

```css
.MyComponent-image {
  display: block;
  outline: solid 1px rgba(0, 0, 0, 0.25);
  outline-offset: -1px;
  background-color: #eee;

  @media (max-width: 749px) {
    width: calc(100% - 40px);
    max-width: 360px;
    margin: 0 auto;
  }

  @media (min-width: 750px) {
    float: right;
    margin-right: 20px;
  }
}
```

#### Share breakpoints between components

Try to use 2–3 main breakpoints and reuse them throughout the site or application. Using Sass, you can store those breakpoints in variables:

```css
$bp-medium: 750px;
$bp-large: 1100px;
$bp-xlarge: 1400px;

// By convention, when using max-width you should
// remove 1px to avoid conflicts if the viewport
// width is exactly $bp-medium
@media (max-width: $bp-medium - 1px) {…}
@media (min-width: $bp-medium) {…}
```

### Use named media queries

Name media queries allow you to define a media query once, and reuse it every time. In CSS proposals, it looks like this:

```css
@media (--my-media-query) {…}
```

Since this feature is not standardized or supported yet, we can mimick this behavior in Sass to make our Sass code easier to maintain. Use this `mq-build` function to store full media queries in variables:

```css
@import 'node_modules/sass-mq-build/mq-build';
$mq-small: mq-build(null, 750px);
$mq-medium: mq-build(750px, 1100px);
$mq-large: mq-build(1100px, null);

.something {
  @media ($mq-small) {
    color: green;
  }
  @media ($mq-medium) {
    color: red;
  }
}
```

## Testing

### How to test ready in a component

```javascript
document.body.insertAdjacentHTML('afterbegin', '<body></body>')
let vm = new Vue({
  template: '<div><my-component v-ref:component"></my-component></div>',
  components: {
    MyComponent
  }
}).$mount('body')
```

The `ready` is triggerd with `mount('body')`. You can also trigger event destroy with `vm.$refs.component.$destroy`.

### How to test with $router in ready

```javascript
document.body.insertAdjacentHTML('afterbegin', '<body></body>')
let vm = new Vue({
  template: '<div><my-component v-ref:component"></my-component></div>',
  components: {
    MyComponent
  }
})
vm.$router = { go: sandbox.stub(), _children: { push: sandbox.stub() } }
vm.$mount('body')
```

### How to test with $dispatch in ready

```javascript
$dispatch = sandbox.stub(Vue.prototype, '$dispatch')
document.body.insertAdjacentHTML('afterbegin', '<body></body>')
let vm = new Vue({
  template: '<div><my-component v-ref:component"></my-component></div>',
  components: {
    MyComponent
  }
})
vm.$router = { go: sandbox.stub(), _children: { push: sandbox.stub() } }
vm.$mount('body')
```
