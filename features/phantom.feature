Feature: Test that Phantom works

  @dummyBefore
  Scenario: Open a page and do a dummy action
    Given I go to the login page
    Then I have a login button
