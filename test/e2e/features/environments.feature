Feature: Environments

  Environment management

  Scenario: As a user I want to be able to create a new environment
    Given I open the admin console with no environments
    When I create a new environment called local
    Then I should see local in the environment dropdown
