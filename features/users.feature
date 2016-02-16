Feature: Test the users CRUD page

  Background:
    Given I go to the login page
    And I authenticate
    Then I am authenticated

  @mytest
  Scenario: Existing profiles appear in the list on the main page.
    When I go on the browse users page
    Then I have a list with "2" elements

  @mytest
  Scenario: The user is able to access the associated profile's user
    When I go on the browse users page
    Then I can see the profile associated to a user
    And I click on the profile associated to a user
    Then I am on the full view edit profiles page

  @mytest
  Scenario: The user is able to edit an user using the detailed view.
    When I go on the browse users page
    And I click the full view edit button of the last users
    Then I am on the full view edit users page
    And I have input "user-id"
    And The input "user-id" is disabled

  @mytest
  Scenario: The user is able to edit an user using the inline view.
    When I go on the browse users page
    And I click the inline edit button of the last user
    Then I see the inline editor of the last user
    When I click the save button of the last user
    Then I get a successful updated user notification

  @mytest
  Scenario: The user is able to create an new user.
    When I go on the browse users page
    And I click the add user button
    Then I am on the add user page
    And I have input "user-id"
    And The input "user-id" is not disabled
    And The input "user-id" is empty

  @mytest
  Scenario: The user is able to clone an user.
    When I go on the browse users page
    And I click the clone button of the last user
    Then I am on the add user page
    And I have input "user-id"
    And The input "user-id" is not disabled
    And The input "user-id" is empty
    When I fill the input "id" with "newUser"
    And I click the create button
    Then I am on the browse users page
    And I see "newUser" in the user list

  # Should we prevent the deletion of users that are used by existing users?
  @mytest
  Scenario: The user is able to delete an user.
    When I go on the browse users page
    And I click the delete button of the last user
    Then I can see "modal-delete-user" modal
    When I fill the confirmation modal with the name of the deleted user
    And I confirm the deletion
    Then I am on the browse users page
    And I do not see the deleted user in the users list

  @mytest
  Scenario: The user is unable to edit an unexisting user.
    When I go to the full view of an unexisting user
    Then I see a message saying the user does not exist
