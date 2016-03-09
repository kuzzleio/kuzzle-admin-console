Feature: Test the users CRUD page

  Background:
    Given I go to the login page
    And I authenticate as "admin"
    Then I am authenticated

  Scenario: Existing profiles appear in the list on the main page.
    Given I go on the browse users page
    Then I have a list with at least "2" elements

  Scenario: I am able to access the associated profile's user
    Given I go on the browse users page
    Then I can see the profile associated to a user
    And I click on the profile associated to a user
    Then I am on edit profile page

  Scenario: I am able to edit an user using the detailed view.
    Given I go on the browse users page
    Then I click the full view edit button of the last users
    Then I am on the edit users page
    And I have input "user-id"
    And The input "user-id" is disabled

  @cleanSecurity
  Scenario: I am able to edit an user using the inline view.
    Given I go on the browse users page
    Then I click the inline edit button of the last user
    Then I see the inline editor of the last user
    When I click the save button of the last user
    Then I get a successful updated user notification

  @cleanSecurity
  Scenario: I am able to create a new user.
    Given I go on the browse users page
    Then I click the add user button
    Then I am on the add user page
    And I have input "user-id"
    And The input "user-id" is not disabled
    And The input "user-id" is empty

  @cleanSecurity
  Scenario: I am able to clone a user.
    Given I go on the browse users page
    Then I click the clone button of the last user
    Then I am on the add user page
    And I have input "user-id"
    And The input "user-id" is not disabled
    And The input "user-id" is empty
    When I fill the input "user-id" with "newUser"
    And I click the create button
    Then I am on the browse users page
    And I see "newUser" in the user list

  @cleanSecurity
  Scenario: I am able to delete a user
    Given I go on the browse users page
    Then I delete the user "kuzzle-bo-dummy"
    And I'm waiting 2 sec
    When I go on the browse users page
    Then I do not see the deleted user in the users list

  Scenario: I am unable to edit an unexisting user.
    When I try to go to the edit page of an unexisting user
    Then I see a message saying the user does not exist
