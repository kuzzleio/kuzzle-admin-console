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
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on the test collection
    Then I have a list with "2" elements

  Scenario: I will be redirected to indexes browse page if i try to select an wrong collection
    Given I am on browse data page with an wrong index
    Then I am on manage index page

  Scenario: The search displays only the results that match the filters
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on the test collection
    Then I have a list with "2" elements
    Then I fill the input "filter-field" with "username"
    Then I fill the input "filter-value" with "alovelace"
    And I click on "submit-filter" button
    Then I have a list with "1" elements

  Scenario: Button access full view
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on the test collection
    When I click on link to access to "alovelace" full document page
    Then the current URL corresponds to the "alovelace" full document page

  Scenario: Button create a document
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on the test collection
    When I click on add document button
    Then the current URL corresponds to the add document page

  Scenario: Form for create a new document is well displayed
    Given I am on page for create document
    Then I have an id input
    And I have a form with fieldset "name" with field "first"
    And I have a form with fieldset "name" with field "last"
    And I have input "username"

  @cleanDb
  Scenario: Create a new document
    Given I am on page for create document
    Then I'm waiting for the element with class "edit-id"
    Then I fill the input "id" with "foo"
    And I fill the input "first" with "first-bar"
    And I fill the input "last" with "last-bar"
    And I fill the input "username" with "username-bar"
    And I click on "create" button
    # Wait 1sec for let ES index the new doc
    Then I'm waiting 1 sec
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on the test collection
    Then I have a list with "3" elements

  @cleanDb
  Scenario: Create document and stay on form
    Given I am on page for create document
    Then I'm waiting for the element with class "edit-id"
    Then I fill the input "id" with "foo"
    And I fill the input "first" with "first-bar"
    And I fill the input "last" with "last-bar"
    And I fill the input "username" with "username-bar"
    And I check the checkbox with class "create-another"
    And I click on "create" button
    Then the current URL corresponds to the add document page

  Scenario: Edit schema on document creation
    Given I am on page for edit document "alovelace"
    Then I have an input with id "id"
    And I have an input with id "first"
    And I have an input with id "last"
    And I have an input with id "username"
    Then I click on add attribute button
    And I fill the input "new-attribute-name" with "myNewField"
    And I select in "new-attribute-type" the text "String"
    And I select in "new-attribute-after" the text "Root document"
    Then I add the new attribute
    And I have an input with id "myNewField"

  @cleanDb
  Scenario: Delete a document
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on the test collection
    Then I have a list with "2" elements
    And I delete the last element in list and I cancel
    Then I have a list with "2" elements
    And I delete the last element in list
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on the test collection
    Then I have a list with "1" elements

  @cleanDb
  Scenario: Edit a document
    Given I am on page for edit document "alovelace"
    Then I fill the input "username" with "foo"
    And I click on "update" button
    Given I am on page for edit document "alovelace"
    Then the field "username" has the value "foo"

  Scenario: Edit inline a document
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on the test collection
    Then I click on edit-inline button of "alovelace" document
    Then a text area for document "alovelace" is displayed
