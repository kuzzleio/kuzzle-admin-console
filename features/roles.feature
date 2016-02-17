Feature: Test the roles CRUD page

  Background:
    Given I go to the login page
    And I authenticate
    Then I am authenticated

  Scenario: Existing roles appear in the list on the main page.
    When I go on the browse roles page
    Then I have a list with "1" elements

  Scenario: The user is able to edit a role using the detailed view.
    When I go on the browse roles page
    And I click the full view edit button of the first role
    Then I am on the full view edit role page
    And I have input "role-id"
    And The input "role-id" is disabled

  Scenario: The user is able to edit a role using the inline view.
    When I go on the browse roles page
    And I click the inline edit button of the first role
    Then I see the inline editor of the first role
    When I click the save button of the first role
    Then I get a successful updated role notification

  Scenario: The user is able to create a new role.
    When I go on the browse roles page
    And I click the add role button
    Then I am on the add role page
    And I have input "role-id"
    And The input "role-id" is not disabled
    And The input "role-id" is empty

  Scenario: The user is able to clone a role.
    When I go on the browse roles page
    And I click the clone button of the first role
    Then I am on the add role page
    And I have input "role-id"
    And The input "role-id" is not disabled
    And The input "role-id" is empty
    When I fill the input "role-id" with "newRole"
    And I click the create button
    Then I am on the browse roles page
    And I see "newRole" in the roles list

  # Should we prevent the deletion of roles that are used by existing profiles?
  Scenario: The user is able to delete a role.
    When I go on the browse roles page
    And I click the delete button of the first role
    Then I can see "modal-delete-role" modal
    When I fill the confirmation modal with the name of the deleted role
    And I confirm the deletion
    Then I am on the browse roles page
    And I do not see the deleted role in the roles list

  Scenario: The user is unable to edit an unexisting role.
    When I go to the full view of an unexisting Role
    Then I see a message saying the role does not exist
