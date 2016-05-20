Feature: Test collections page
  As a user
  I want to browse collection, create collection, ...

  @createIndex
  Background:
    Given I go to the login page
    And I authenticate as "admin"
    Then I am authenticated

  Scenario: List collection
    Given I go to browse collection page
    Then I have a list with "6" collections

  Scenario: Add collection button
    Given I go to browse collection page
    When I click on add collection button
    Then I am on create collection page

  @cleanDb
  Scenario: Create a new collection
    Given I go to the create collection page
    And I fill the input "name" with "foo"
    And I click on "create" button
    # Wait 1sec for let ES index the new doc
    And I'm waiting 1 sec
    Then I am on browse collection page
    And I have a list with "7" collections

  @cleanDb
  Scenario: Access to collection edit
    Given I go to browse collection page
    When I click on full view button for collection "kuzzle-bo-test"
    Then I am on edit collection page for collection "kuzzle-bo-test"

  @cleanDb
  Scenario: Access to documents list
    Given I go to browse collection page
    When I click on documents list button for collection "kuzzle-bo-test"
    Then I am on browse data page for collection "kuzzle-bo-test"
    And I'm waiting 4 sec
    Then I have a list with "2" elements

  @cleanDb
  Scenario: Empty a collection
    Given I go to browse collection page
    When I click on empty button for collection "kuzzle-bo-test"
    # Wait 1sec for let ES index the new doc
    And I'm waiting 1 sec
    Given I go to the browse data page for collection "kuzzle-bo-test"
    Then I have a list with "0" elements
