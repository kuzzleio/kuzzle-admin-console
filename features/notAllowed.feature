Feature: Test all the actions that are not allowed by rights

  Background:
  Given I go to the login page
  And I authenticate as "standard"
  Then I am authenticated

  @myTest
  Scenario: I do not see the Add Collection button if I have no right
    When I go to collection browse page
    Then I do not see the Add Collection button

  @myTest
  Scenario: I am able to empty a collection only if I have the right to
    When I am on browse data page
    And I click on the collection selector
    And I click on the collection named "deletable-collection"
    And I click on the cog
    Then I do not see the "Empty" menu item

  @myTest
  Scenario: I am able to edit a collection only if I have the right to
    When I am on browse data page
    And I click on the collection selector
    And I click on the collection named "deletable-collection"
    And I click on the cog
    Then I do not see the "Edit" menu item

  @myTest
  Scenario: I am able to delete a collection only if I have the right to
    When I am on browse data page
    And I click on the collection selector
    And I click on the collection named "editable-collection"
    And I click on the cog
    Then I do not see the "Delete" menu item

  @myTest
  Scenario: I do not see the cog if I have no rights on the collection
    When I am on browse data page
    And I click on the collection selector
    And I click on the collection named "readonly-collection"
    Then I do not see the cog

  @myTest
  Scenario: I don't see Add Collection

  @myTest
  Scenario: I don't see Add index

  @myTest
  Scenario: I can't delete an index

  @myTest
  Scenario: I can see security dongle

  @browseData @myTest
  Scenario: I can create document only if I have the right to
    When I am on browse data page
    When I click on the collection selector
    Given I click on collection "private-collection"
    Then I do not see the add document button

  @browseData @myTest
  Scenario: I can't edit document inline in collection "readonly-collection"
    When I am on browse data page
    When I click on the collection selector
    Given I click on collection "private-collection"
    Then I have a list with "1" element
    Then I do not see the edit pencil of the document in position "1"

  @browseData @myTest
  Scenario: I can't delete document in collection "readonly-collection"
    When I am on browse data page
    When I click on the collection selector
    Given I click on collection "private-collection"
    Then I have a list with "1" element
    Then I do not see the cogwheel of the document in position "1"

  @realtime @myTest
  Scenario: I can not subscribe
    When I go to the realtime page
    When I click on the collection selector
    Given I click on collection "private-collection"
    Then I can not see filter form

  @realtime @myTest
  Scenario: I can not publish
    When I go to the realtime page
    When I click on the collection selector
    Given I click on collection "private-collection"
    Then I can not see publish form

  @metrics @myTest
  Scenario: I see an empty metrics
    When I am on metrics page
    Given I see the page title "System metrics"
    Then I have a display of "0" widgets

  @metrics @myTest
  Scenario: I do not have metrics link in sidebar
    Then I do not see the sidebar metrics link

