Feature: Test authentication
  As a user
  I want to be able to login and logout.

  Scenario: I can login by providing the correct credentials
    Given I go to the login page
    And I authenticate as "admin"
    Then I am authenticated

  Scenario: I can logout by pressing the logout button
    Given I go to the login page
    And I authenticate as "admin"
    Then I am authenticated
    And I click the logout button
    Then I am logged out

  Scenario: I cannot visit an authenticated page if I am not logged in
    Given I go to the logout page
    When I try to go to browse data page
    Then I am on the login page
