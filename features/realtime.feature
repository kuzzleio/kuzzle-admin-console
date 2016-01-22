Feature: Test realtime watch data pages
  As a user
  I want to watch realtime events occurring on my collections.

  @createIndex
  Background:
    Given I go to the login page
    And I authenticate
    Given I go to the realtime page
    And I click on the collection selector
    Given I click on a collection
    And I subscribe to the collection events

  @cleanDb @unsubscribe
  Scenario: I can subscribe to a collection
    Then I am subscribed

  @cleanDb @unsubscribe
  Scenario: I can clear the message log
    Given I clear the message log
    Then The message log is empty

  @cleanDb @unsubscribe
  Scenario: Once subscribed, I receive notifications about document creations
    Given I clear the message log
    And I create a persistent document
    Then I receive the notification that the document has been created

#  @cleanDb @unsubscribe
#  Scenario: Once subscribed, I receive notifications about document updates
#    Given I create a persistent document
#    And I clear the message log
#    And I update a persistent document
#    Then I receive the notification that the document has been updated
#
#  @cleanDb @unsubscribe
#  Scenario: Once subscribed, I receive notifications about document deletions
#    Given I create a persistent document
#    And I clear the message log
#    And I delete a persistent document
#    Then I receive the notification that the document has been deleted
#
#  @cleanDb @unsubscribe
#  Scenario: Once subscribed, I receive notifications about volatile messages
#    Given I clear the message log
#    And I publish a volatile message
#    Then I receive the notification about the volatile message
#
#  @cleanDb @unsubscribe
#  Scenario: Once subscribed, I receive notifications about users joining the room
#    Given I clear the message log
#    And Someone subscribes to my room
#    Then I receive the notification about the new user entering the room
#
#  @cleanDb @unsubscribe
#  Scenario: Once subscribed, I receive notifications about users leaving the room
#    Given Someone subscribes to my room
#    And I clear the message log
#    And Someone unsubscribes from the room
#    Then I receive the notification about the user leaving the room
#
#  @cleanDb
#  Scenario: Once unsubscribed, I do not receive any notification
#    Given I unsubscribe from the collection
#    And I clear the message log
#    And I create a persistent document
#    Then The message log is empty
#
