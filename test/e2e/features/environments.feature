@environments
Feature: Environments

  Users must be able to create, edit, delete and switch environments. Environments can be
  assigned a color, which is applied to the navigation bar.

  Scenario: As a user I want to be able to create a new environment
    Given I open the admin console with no environments
    When I create a new valid environment called local
    Then I should see local in the environment dropdown
    And I am connected to the selected environment

  @visual
  Scenario: As a user I want to see the environment creation form
    Given I open the admin console with no environments
    Then The environment creation form is visible and well formed

  Scenario: As a user I want to be able to delete an environment
    Given I open the admin console with no environments
    When I create a new valid environment called toDelete
    And I delete the environment called toDelete
    Then I should not see toDelete in the environment dropdown

  Scenario Outline: As a user I want to be able to set a color to an environment
    Given I open the admin console with no environments
    When I create a new valid environment called colored with color <color-index>
    And I login as anonymous
    Then I am logged in
    And I should see that the navbar has the background color <color>

    Examples:
      | color-index | color   |
      | 3           | rgb(142, 36, 170) |
      | 4           | rgb(104, 159, 56) |

# Scenario: As a user I want to be able to switch from an invalid scenario to a valid one
#   Given I open the admin console with no environments
#   When I create a new valid environment called local

