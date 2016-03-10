Feature: Test browse data pages
  As a user
  I want to browse data, access to full view, delete, edit, ...

  @createIndex
  Background:
    Given I go to the login page
    And I authenticate as "admin"
    Then I am authenticated

  @cleanDb
  Scenario: Display data list when a collection is selected
    Given I go to the browse data page
    And I click on the collection selector
    And I click on the test collection
    Then I have a list with "2" elements

  Scenario: The search displays only the results that match the filters
    Given I go to the browse data page
    And I click on the collection selector
    And I click on the test collection
    Then I have a list with "2" elements
    Given I fill the input "filter-field" with "username"
    And I fill the input "filter-value" with "alovelace"
    And I click on "submit-filter" button
    Then I have a list with "1" elements

  Scenario: Button access full view
    Given I go to the browse data page
    And I click on the collection selector
    And I click on the test collection
    And I click on link to access to "alovelace" full document page
    Then I am on edit document page for document "alovelace"

  Scenario: Button create a document
    Given I go to the browse data page
    And I click on the collection selector
    And I click on the test collection
    And I click on add document button
    Then I am on create document page

  Scenario: Form for create a new document is well displayed
    Given I go to the create document page
    Then I have an id input
    And I have a form with fieldset "name" with field "first"
    And I have a form with fieldset "name" with field "last"
    And I have input "username"

  @cleanDb
  Scenario: Create a new document
    Given I go to the create document page
    And I'm waiting for the element with class "edit-id"
    And I fill the input "id" with "foo"
    And I fill the input "first" with "first-bar"
    And I fill the input "last" with "last-bar"
    And I fill the input "username" with "username-bar"
    And I click on "create" button
    # Wait 1sec for let ES index the new doc
    And I'm waiting 1 sec
    Given I go to the browse data page
    And I click on the collection selector
    And I click on the test collection
    Then I have a list with "3" elements

  @cleanDb
  Scenario: Create document and stay on form
    Given I go to the create document page
    And I'm waiting for the element with class "edit-id"
    And I fill the input "id" with "foo"
    And I fill the input "first" with "first-bar"
    And I fill the input "last" with "last-bar"
    And I fill the input "username" with "username-bar"
    And I check the checkbox with class "create-another"
    And I click on "create" button
    Then I am on create document page

  Scenario: Edit schema on document creation
    Given I go to the edit document page for document "alovelace"
    Then I have an input with id "id"
    And I have an input with id "first"
    And I have an input with id "last"
    And I have an input with id "username"
    When I click on add attribute button
    And I fill the input "new-attribute-name" with "myNewField"
    And I select in "new-attribute-type" the text "String"
    And I select in "new-attribute-after" the text "Root document"
    And I add the new attribute
    And I'm waiting 4 sec
    Then I have an input with id "myNewField"

  @cleanDb
  Scenario: Delete a document
    Given I go to the browse data page
    And I click on the collection selector
    And I click on the test collection
    Then I have a list with "2" elements
    When I delete the last element in list and I cancel
    Then I have a list with "2" elements
    When I delete the last element in list
    Given I go to the browse data page
    And I click on the collection selector
    And I click on the test collection
    Then I have a list with "1" elements

  @cleanDb
  Scenario: Edit a document
    Given I go to the edit document page for document "alovelace"
    And I fill the input "username" with "foo"
    And I click on "update" button
    Then I am on edit document page for document "alovelace"
    And the field "username" has the value "foo"

  Scenario: Edit inline a document
    Given I go to the browse data page
    And I click on the collection selector
    And I click on the test collection
    And I click on edit-inline button of "alovelace" document
    Then a text area for document "alovelace" is displayed
