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
    When I create a new index called test
    Then I can see the test index in the list
