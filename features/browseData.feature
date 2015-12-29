Feature: Test browse data pages
  As a user
  I want to browse data, access to full view, delete, edit, ...

  Background:
    Given I entered the app
    And I am authenticated

  @cleanDb
  Scenario: Display data list when a collection is selected
    Given I am on browse data page for a collection
    Then I have a list with "2" elements

  Scenario: Button create a document
    Given I am on browse data page for a collection
    When I click on create document button
    Then I am on url corresponding to document full view's route

  Scenario: Form for create a new document is well displayed
    Given I am on document full view's route
    Then I have an id input
    And I have a form with fieldset "name" with fields "first,last"
    And I have inputs "username"

  @cleanDb
  Scenario: Create a new document
    Given I am on document full view's route
    Then I fill the input "id" with "foo"
    And I fill the input "first" with "first-bar"
    And I fill the input "last" with "last-bar"
    And I fill the input "username" with "username-bar"
    And I click on "create" button
    Given I am on browse data page for a collection
    Then I have a list with "3" elements

  @cleanDb
  Scenario: Delete a document
    Given I am on browse data page for a collection
    Then I have a list with "2" elements
    And I delete the last element in list and I cancel
    Then I have a list with "2" elements
    And I delete the last element in list
    Given I am on browse data page for a collection
    Then I have a list with "1" elements

  @cleanDb
  Scenario: Edit a document
    Given I am on page for edit document "alovelace"
    Then I fill the input "username" with "foo"
    And I click on "update" button
    Given I am on page for edit document "alovelace"
    Then the field "username" has the value "foo"
