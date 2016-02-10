Feature: Test the roles CRUD page

  Background:
    Given I go to the login page
    And I authenticate
    Then I am authenticated

  Scenario: Existing roles appear in the list on the main page.
    When I go on the browse roles page
    Then I have a list with "1" elements

  @myTest
  Scenario: The user is able to edit a role using the detailed view.
    When I go on the browse roles page
    And I click on the full view edit button of the first role
    Then I am on the full view edit role page
    And I have input "name"
    And The input "name" is disabled

  Scenario: The user is able to edit a role using the inline view.
    When I go on the browse roles page
    And I click on the inline edit button of the first role

  Scenario: The user is unable to edit an unexisting role.

  Scenario: The user is able to create a new role.

  Scenario: The user is able to clone a role.

  # Should we prevent the deletion of roles that are used by existing profiles?
  Scenario: The user is able to delete a role.
