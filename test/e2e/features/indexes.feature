@indexes
Feature: Indexes Management

  Users must be able to CRUD indexes.

  Background: Login
    When I create a new valid environment called local
    Then I am connected to the selected environment
    When I login as anonymous
    Then I am logged in

  Scenario: As a user, I want to create a new index
    Given I have no indexes
     And The empty indexes list is well-formed
    When I create a new index called test
    Then I can see the test index in the list
     And The indexes list is well-formed

  Scenario: As a user, I want to be unable to create the same index twice
    Given I have no indexes
    When I create a new index called sameindex
     And I create a new index called sameindex
    Then I get an error in the index creation modal

  Scenario: As a user, I want to be able to delete an index
    Given I have no indexes
    When I create a new index called test
     And I delete the test index
    Then I cannot see the test index in the list
