Feature: Test firstAdmin

  @deleteUsers
  Scenario: Create the first admin with bad password.
    When I'm waiting 2 sec
    And I try to go to the login page
    And I'm waiting 4 sec
    Then I am on the first admin creation page
    When I create the admin account as "firstAdminWithBadPassword"
    Then I see an error message about the bad password

  @cleanSecurity
  Scenario: Create the first admin and i can login with this account.
    Given I try to go to the login page
    Then I am on the first admin creation page
    When I create the admin account as "firstAdmin"
    And I'm waiting 2 sec
    Given I go to the login page
    And I authenticate as "firstAdmin"
    Then I am authenticated
    When I click the logout button
    Then I am logged out
