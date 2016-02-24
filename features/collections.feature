Feature: Test collections page
  As a user
  I want to browse collection, create collection, ...

  @createIndex
  Background:
    Given I go to the login page
    And I authenticate as "admin"
    Then I am authenticated

  Scenario: List collection
    Given I am on browse collection page
    Then I have a list with "6" collections

  Scenario: Add collection button
    Given I am on browse collection page
    When I click on add collection button
    Then the current URL corresponds to the add collection page

  @cleanDb
  Scenario: Create a new collection
    Given I am on page for create collection
    Then I fill the input "name" with "foo"
    And I click on "create" button
    # Wait 1sec for let ES index the new doc
    Then I'm waiting 1 sec
    Given I am on browse collection page
    Then I have a list with "7" collections

  Scenario: Access to collection edit
    Given I am on browse collection page
    When I click on full view button for collection "kuzzle-bo-test"
    Then the current URL corresponds to the "kuzzle-bo-test" edit collection page

  @myTest
  Scenario: Access to documents list
    Given I am on browse collection page
    When I click on documents list button for collection "kuzzle-bo-test"
    Then I am on browse data page for collection "kuzzle-bo-test"
    Then I have a list with "2" elements

  @cleanDb @myTest
  Scenario: Delete a collection
    Given I am on browse collection page
    When I click on delete button for collection "kuzzle-bo-test"
    # Wait 1sec for let ES index the new doc
    Then I'm waiting 1 sec
    Given I am on browse collection page
    Then I have a list with "5" collections

  @cleanDb
  Scenario: Empty a collection
    Given I am on browse collection page
    When I click on empty button for collection "kuzzle-bo-test"
    # Wait 1sec for let ES index the new doc
    Then I'm waiting 1 sec
    Given I am on browse data page for collection "kuzzle-bo-test"
    Then I have a list with "0" elements