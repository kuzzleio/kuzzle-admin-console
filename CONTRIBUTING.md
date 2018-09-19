To start the Kuzzle Admin Console in development-mode with hot-reload run the following commands:

```
$ npm install
$ npm run dev
```

The Kuzzle Admin Console will then be accessible at the following URL: http://localhost:3000

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

### End-to-end

We use Chrome Puppeteer to e2e the UI. We both perform interaction tests and visual regression tests. Everything runs in a Mocha test suite and uses [expect-js](https://github.com/Automattic/expect.js) for assertions, even if you won't need them most of the time.

#### Before you start

There are a few things that are good to know, here they go.

- You will need NodeJS version >= 8 to perform end-to-end tests locally because they make heavy use of `async/await`.
- The `world.js` file contains everything you need to interact with Chrome Puppeteer, namely the `browser` and `page` singletons, but also some other useful variables (you should take a look at the `module.exports` in this file). You must always use the singletons provided in this file to interact with Puppeteer.
- The `shared-steps.js` file is your friend. It's here to keep your tests DRY. All the steps that can be factorized and re-used are here. You must put here the steps that are repeated in your tests.
- When performing visual regression testing, you must prepend the name of your test with `[VISUAL]`. This will enable the `update-visual-reference.sh` script to properly update the visual reference for this test.
- You are encouraged to perform your test setup and teardown using the proper Mocha Hooks `beforeEach` and `afterEach`. If these steps involve interacting with data on Kuzzle-side, you should perform these operations via the Kuzzle SDK (it will be much faster and it won't pollute the state of your browser before the test).

#### Interaction tests

You write interaction tests by piloting an instance of Chrome Puppeteer and making it interact with the app feature you want to test. If things go wrong, Puppeteer will not find the elements it expects to interact with, will throw and make the test fail.
You can control Chrome Puppeteer using its [standard API](https://pptr.dev/#?product=Puppeteer&version=v1.8.0) on the `world.page` object. There are a few best practices you should follow, though.

- Always use `utils.waitForSelector` before clicking an element. It will wait for a default timeout you can override by setting the `waitElTimeout` environment variable in your shell. It will also give you richer exceptions than the ones thrown by Puppeteer.
- There are some cases for which `waitForSelector` isn't enough. This method actually just check for the element to be attached to the DOM. Some interactive widgets we use (such as `Dropdown.vue`) hide some parts by attaching their elements to the DOM and assigning them an `absolute` position outside the viewport, which will make `waitForSelector` to return immediately. Sometimes it will return before the element is actually visible and clickable, making the subsequent `click` actions unstable. A solution to this is to use `utils.wait`.
- Always use `utils.click` rather than `page.click`. It will give you richer exceptions than the ones thrown by Puppeteer.
- The elements you interact with should have well-formed BEM-compliant CSS classes: it will be much simpler to find them in the page. If you follow the styling guidelines you'll be just fine.
- You can use the Chrome Extension [Puppeteer Recorder](https://github.com/checkly/puppeteer-recorder) to live-record your clicks on the page, but it's not very solid. It is way better to use the BEM classes to interact with elements in the page.

#### Visual Regression tests

You write visual regression tests just like you write normal interaction tests. The only difference is that you'll take a screenshot at some point, store it in the `visual-regression/current` directory, and then compare it to the reference by calling the `utils.compareScreenshot` function. This will generate a diff file in `visual-regression/diff`.
To write a visual regression test, follow the example below

```javascript
// Do not forget the [VISUAL] prefix in the name
it('[VISUAL] Indexes page (empty state)', async () => {
  // Set a screenshot name following this convention
  const screenshotName = 'data.indexes.empty'

  // Get the path where the current screenshot will be stored
  const currentScreenshotPath = utils.getCurrentScreenshotPath(screenshotName)

  // Go to the screen you want to test
  const page = await world.getPage()
  await page.goto(world.url)
  await sharedSteps.logInAsAnonymous(page)

  // Take the screenshot and save it in the right place
  await page.screenshot({
    path: currentScreenshotPath
  })

  // This will perform a visual comparison between the current
  // screenshot and the reference one (versioned).
  // The diff will be output in `visual-regression/diff/${screenshotName}`
  await utils.compareScreenshot(screenshotName)
})
```

Now, the first time you write such a test, the reference screenshot will not exist (because, probably, even the screen to test didn't exist) and the test will fail. This is ok, read further.

##### Updating reference screenshots

- Every time you write a **new test** for the first time, you should run `npm run e2e-update-reference`. This script will generate all the screenshots and copy the new ones to the `reference` directory.
- Whenever you want to **update an existing test**, you'll have to manually overwrite the existing reference with the new screenshot: the scripts won't do that for you. Don't forget to commit your references.

#### All green locally, red on Travis

Yeah, sometimes life is a shit. 99% of the time, shit happens because Puppeteer is rendering the UI _slightly slower_ on Travis than on your local machine. This is frustrating but it's also a good thing, because it helps you spot wrong assumptions you do in your code.
But don't worry, we got your back: here goes a list of things you can check in order to understand what goes on on the good ol' fellow Travis.

- Exceptions are your friends. If you properly used `utils.waitForSelector` and `utils.click`, the exception will mention the selector involved in the problem. That info will help you understand which part of your code causes the trouble.
- You can also go to the Kuzzle Cloudinary account and take a look at the screenshot that has been taken right after the test failed (the filename will be `admin-console-test-fail-${Date.now()}`). You'll find it by searching the tag `travis-${TRAVIS_BUILD_NUMBER}` (the build number is written in the build header).
- If it's a timeout problem, try giving it MOAR timeout (by setting the `waitElTimeout` in the Travis settings).
- If it's a click that fails, it's probably because Puppeteer didn't have the time to make the element appear. Did you wait for the element?
- If you _did wait_ for the element but the click still fails, then it's probably that waiting for the element doesn't make sense. Some interactive widgets we use (such as `Dropdown.vue`) hide some parts by attaching their elements to the DOM and assigning them an `absolute` position outside the viewport, which will make `waitForSelector` to return immediately. Sometimes it will return before the element is actually visible and clickable, making the subsequent `click` actions unstable. As a workaround, you can `utils.wait` a hardcoded amount of time (this is still a hack, but it's all we have for now).
- If it's a visual diff problem, go directly to Cloudinary, search the tag corresponding to the build number (as explained above) and take a look at the diff files.
