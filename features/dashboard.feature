Feature: Test dashboard page
  As a user
  I want to consult server state and information

  Background:
    Given I go to the login page
    And I authenticate
    Then I am authenticated

  Scenario: Display widgets
    Given I am on dashboard page
    Then I have a display of "5" widgets

  Scenario: See serverInfo widget
    Given I am on dashboard page
    Then I see the "serverInfo" widget
    And I have "8" table line elements in "serverInfo" widget

  Scenario: See apiInfo widget
    Given I am on dashboard page
    Then I see the "apiInfo" widget
    And I have at least "7" table line elements in "apiInfo" widget

  Scenario: See pluginInfo widget
    Given I am on dashboard page
    Then I see the "pluginInfo" widget
    And I have at least "4" table line elements in "pluginInfo" widget

  Scenario: See statInfo widget
    Given I am on dashboard page
    Then I see the "statInfo" widget
    And I have "1" chart elements in "statInfo" widget

  Scenario: See resourceInfo widget
    Given I am on dashboard page
    Then I see the "resourceInfo" widget
    And I have "2" gauge elements in "resourceInfo" widget
