Feature: Test authentication
  As a user
  I want to be able to login and logout.

  Scenario: Log a user in when she provides correct credentials
    Given I go to the login page
    Then I authenticate as "admin"
    Then I am authenticated

  Scenario: The user is logged out when she presses the logout button
    Given I go to the login page
    Then I authenticate as "admin"
    Then I am authenticated
    And I click the logout button
    Then I am logged out

  Scenario: The not authentified user is denied to visit an authenticated page
    Given I go to the logout page
    When I try to go to browse data page
    Then I am on the login page
