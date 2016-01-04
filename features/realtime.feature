Feature: Test realtime watch data pages
  As a user
  I want to watch realtime events occurring on my collections.

  @createIndex
  Background:
    Given I go to the login page
    And I authenticate

  @cleanDb
  Scenario: I can subscribe to a collection
    Given I go to the realtime page
    Then I see the collection selector
    And I click on the collection selector
    Then I see my collections
    Given I click on a collection
    And I subscribe to the collection events
    Then I see that I am subscribed

  @cleanDb
  Scenario: Once subscribed, I receive notifications about document creations
    Given I go to the realtime page
    And I click on the collection selector
    Given I click on a collection
    And I subscribe to the collection events
    And I clear the message log
    And I create a persistent document
    Then I receive the notification that a new document has been created

  Scenario: Once subscribed, I receive notifications about document updates

  Scenario: Once subscribed, I receive notifications about document deletions

  Scenario: Once subscribed, I receive notifications about volatile messages

  Scenario: Once subscribed, I receive notifications about users joining the room

  Scenario: Once subscribed, I receive notifications about users leaving the room
