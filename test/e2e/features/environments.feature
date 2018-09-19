@environments
Feature: Environments

  Users must be able to create, edit, delete and switch environments. Environments can be
  assigned a color, which is applied to the navigation bar.

  Scenario: As a user I want to be able to create a new environment
    Given I open the admin console with no environments
    When I create a new valid environment called local
    Then I should see local in the environment dropdown

  @visual
  Scenario: As a user I want to see the environment creation form
    Given I open the admin console with no environments
    Then The environment creation form is visible and well formed
