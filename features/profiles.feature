Feature: Test the profiles CRUD page

  Background:
    Given I go to the login page
    And I authenticate as "test" with password "test"
    Then I am authenticated

  Scenario: Existing profiles appear in the list on the main page.
    When I go on the browse profiles page
    Then I have a list with at least "1" elements

  Scenario: The user is able to access the associated roles' profile
    When I go on the browse profiles page
    Then I can see the roles list associated to a profile
    And I click on the first role on the roles list associated to a profile
    Then I am on the full view edit role page

  Scenario: The user is able to edit a role using the detailed view.
    When I go on the browse profiles page
    And I click the full view edit button of the last profiles
    Then I am on the full view edit profiles page
    And I have input "profile-id"
    And The input "profile-id" is disabled

  Scenario: The user is able to edit a profile using the inline view.
    When I go on the browse profiles page
    And I click the inline edit button of the last profile
    Then I see the inline editor of the last profile
    When I click the save button of the last profile
    Then I get a successful updated profile notification

  Scenario: The user is able to create a new profile.
    When I go on the browse profiles page
    And I click the add profile button
    Then I am on the add profile page
    And I have input "profile-id"
    And The input "profile-id" is not disabled
    And The input "profile-id" is empty

  Scenario: The user is able to clone a profile and delete it.
    When I go on the browse profiles page
    And I click the clone button of the last profile
    Then I am on the add profile page
    And I have input "profile-id"
    And The input "profile-id" is not disabled
    And The input "profile-id" is empty
    When I fill the input "profile-id" with "newProfile"
    And I click the create button
    Then I am on the browse profiles page
    And I see "newProfile" in the profile list
    # Should we prevent the deletion of profiles that are used by existing users?
    And I click the delete button of the profile "newProfile"
    Then I can see "modal-delete-profile" modal
    When I fill the confirmation modal with the name of the deleted profile
    And I confirm the deletion
    Then I am on the browse profiles page
    And I do not see the deleted profile in the profiles list

  Scenario: The user is unable to edit an unexisting profile.
    When I go to the full view of an unexisting profile
    Then I see a message saying the profile does not exist
