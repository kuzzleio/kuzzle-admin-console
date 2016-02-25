Feature: Test firstAdmin

  @deleteUsers
  Scenario: Create the first admin with bad password.
    Given I go to the login page
    Then I see the first admin creation page
    And I create the admin account as "firstAdminWithBadPassword"
    Then I see an error message about the bad password

  Scenario: Create the first admin.
    Given I go to the login page
    Then I see the first admin creation page
    And I create the admin account as "firstAdmin"

  @cleanSecurity
  Scenario: Log as the just created firstAdmin account.
    Given I go to the login page
    Then I see the login page
    And I authenticate as "firstAdmin"
    Then I am authenticated
    And I click the logout button
    Then I am logged out
