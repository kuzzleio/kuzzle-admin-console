Feature: Test all the actions that are not allowed by rights

  Background:
  Given I go to the login page
  And I authenticate as "standard"
  Then I am authenticated

  Scenario: I do not see the Add Collection button if I have no right
    Given I go to browse collection page
    Then I do not see the Add Collection button

  Scenario: I am able to empty a collection only if I have the right to
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on the collection named "deletable-collection"
    And I click on the cog
    Then I do not see the "Empty" menu item

  Scenario: I am able to edit a collection only if I have the right to
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on the collection named "deletable-collection"
    And I click on the cog
    Then I do not see the "Edit" menu item

  Scenario: I am able to delete a collection only if I have the right to
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on the collection named "editable-collection"
    And I click on the cog
    Then I do not see the "Delete" menu item

  Scenario: I do not see the cog if I have no rights on the collection
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on the collection named "readonly-collection"
    Then I do not see the cog

  Scenario: I don't see Add Collection

  Scenario: I don't see Add index

  Scenario: I can't delete an index

  Scenario: I can see security dongle

  @browseData
  Scenario: I can create document only if I have the right to
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I do not see the add document button

  @browseData
  Scenario: I can't edit document inline in collection "readonly-collection"
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I have a list with "1" element
    And I do not see the edit pencil of the document in position "1"

  @browseData
  Scenario: I can't delete document in collection "readonly-collection"
    Given I go to the browse data page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I have a list with "1" element
    And I do not see the cogwheel of the document in position "1"

  @realtime
  Scenario: I can not subscribe
    Given I go to the realtime page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I can not see filter form

  @realtime
  Scenario: I can not publish
    Given I go to the realtime page
    Then I click on the collection selector
    And I click on collection "private-collection"
    Then I can not see publish form

  @metrics
  Scenario: I see an empty metrics
    Given I go to metrics page
    Then I see the page title "System metrics"
    And I have a display of "0" widgets

  @metrics
  Scenario: I do not have metrics link in sidebar
    Then I do not see the sidebar metrics link
