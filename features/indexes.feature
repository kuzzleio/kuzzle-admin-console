Feature: Test multi index features
  As a user
  I want to browse indexes, select which index I am working on and create a new one

  @createIndex
  Background:
    Given I go to the login page
    And I authenticate  as "test" with password "test"
    Then I am authenticated

  @cleanDb
  Scenario: I can select an index with the index selector in sidebar
    Given I go to manage index page
    Then No index is selected
    Then I can not see Storage & Realtime menu entries
    Then I click on the index selector
    Then I select an index
    Then The index "mainindex" is selected
    Then I can see Storage & Realtime menu entries

  Scenario: I can select an index directly in the manage index page
    Given I go to manage index page
    Then No index is selected
    Then I can not see Storage & Realtime menu entries
    Then I click on the first index in manage index page
    Then I am on collection browse page
    Then The index "mainindex" is selected
    Then I can see Storage & Realtime menu entries

  Scenario: I can access the index creation page in manage index page
    Given I go to manage index page
    Then I click on create index button
    Then I am on index creation page

  Scenario: I can create an index in index creation page
    Given I go to index creation page
    Then I fill the input "name" with "index-foo"
    And I click on "create" button
    Then I am on manage index page
    Then I can see "2" indexes in list

  Scenario: I can delete an index in manage index page
    Given I go to manage index page
    Then I can see "2" indexes in list
    Then I click on the index option selector
    Then I click on Delete dropdown menu item
    Then I can see "modal-delete-index" modal
    Then The button "modal-delete-index-delete" is disabled
    Then I fill the input "modal-delete-index-name" with "index-foo"
    Then The button "modal-delete-index-delete" is not disabled
    And I click on "modal-delete-index-delete" button
    Then I can see "1" indexes in list

  Scenario: I can access to collection and to browse data quickly
    Given I go to manage index page
    Then I click on the first index in manage index page
    Then I am on collection browse page
    Then I click on the first collection in browse document page
    Then I am on browse document page
