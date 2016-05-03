Feature: Test all the actions that are not allowed by rights

  Background:
  Given I go to the login page
  And I authenticate as "standard"
  Then I am authenticated

  Scenario: I do not see the Add Collection button if I have no right
    Given I go to browse collection page
    Then I do not see the Add Collection button
    Then I go to the logout page

  Scenario: I am able to empty a collection only if I have the right to
    Given I go to the browse data page
    Then I click on the collection selector
    When I go to the browse data page for collection "not-editable-collection"
    And I take a screenshot "beforeCog"
    And I click on the cog
    Then I do not see the "Empty" menu item
    Then I go to the logout page

  Scenario: I am able to edit a collection only if I have the right to
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on the collection named "emptiable-collection"
    And I click on the cog
    Then I do not see the "Edit" menu item
    Then I go to the logout page

  Scenario: I do not see the cog if I have no rights on the collection
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on the collection named "readonly-collection"
    Then I do not see the cog
    Then I go to the logout page

  @browseData
  Scenario: I can create document only if I have the right to
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I do not see the add document button
    Then I go to the logout page

  @browseData
  Scenario: I can't edit document inline in collection "readonly-collection"
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I have a list with "1" element
    And I do not see the edit pencil of the document in position "1"
    Then I go to the logout page

  @browseData
  Scenario: I can't delete document in collection "readonly-collection"
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I have a list with "1" element
    And I do not see the cogwheel of the document in position "1"
    Then I go to the logout page

  @realtime
  Scenario: I can not subscribe
    Given I go to the realtime page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I can not see filter form
    Then I go to the logout page

  @realtime
  Scenario: I can not publish
    Given I go to the realtime page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I can not see publish form
    Then I go to the logout page

  @metrics
  Scenario: I see an empty metrics
    Given I go to metrics page
    Then I see the page title "System metrics"
    And I have a display of "0" widgets
    Then I go to the logout page

  @metrics
  Scenario: I do not have metrics link in sidebar
    Then I do not see the sidebar metrics link
    Then I go to the logout page
