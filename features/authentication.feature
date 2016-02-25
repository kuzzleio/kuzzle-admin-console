Feature: Test authentication
  As a user
  I want to be able to login and logout.

  Scenario: Log a user in when she provides correct credentials
    Given I go to the login page
    Then I see the login page
    And I authenticate as "admin"
    Then I am authenticated

  Scenario: The user is logged out when she presses the logout button
    Given I go to the login page
    And I authenticate as "admin"
    Then I am authenticated
    And I click the logout button
    Then I am logged out

  @anonymousAsInitial
  Scenario: The not authentified user is denied to visit an authenticated page
    Given I go to the logout page
    And I am on browse data page
    Then I see the login page
