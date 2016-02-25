# How to contribute to Kuzzle Backoffice

## Testing Guidelines

To ensure our code works, we perform behavior-oriented tests based on CucumberJS.
The main framework is WebdriverIO, which executes the Cucumber scenarii and
drives an instance of PhantomJS via the embedded Selenium GhostDriver.

We would like you to stick to the following guidelines.

We differentiate here the terms MUST and SHOULD. Their usage is formally tied to
their literal meaning.

### Scenarii

* Test scenarii MUST be independent from each other.
* Test scenarii MUST leave the data in the same state as before their execution.
* Test scenarii SHOULD use preparation and cleanup hooks only when necessary, in order to optimize execution time.

### Steps

* Step descriptions MUST be written in first person.
* Step descriptions SHOULD be reused as much as possible.
* The usage of the terms “When”, “Given” and “Then” is bound to the following rules
  * When introduces an action with no assertion in its definition. E.g. “When I go to the browse data page”.
  * Given introduces an action with an assertion in its definition. E.g. “Given I go to the browse data page” (ensuring that the resulting URL is ok).
  * Then introduces a statement with an assertion in its definition. E.g. “Then I see 3 elements in the list”.
* Test scenarii SHOULD minimize the wait timeouts, in order to optimize the execution time.
* Steps definitions SHOULD be grouped and ordered as following: “When”, “Given”, “Then”.

### Assertions

* Assertions in steps SHOULD always provide a failure message.
