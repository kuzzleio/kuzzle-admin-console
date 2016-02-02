Feature: Test application-wide features

  @currentTest
  Scenario: Display a notification while disconnected from the Kuzzle server
    When I shut down the Kuzzle server
    Then I get a disconnection notification
