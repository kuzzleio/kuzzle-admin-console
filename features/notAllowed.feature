Feature: Test all the actions that are not allowed by rights

  Scenario: I do not see the button if I cannot create a new collection
  Scenario: I am able to empty a collection only if I have the right to
  Scenario: I am able to edit a collection only if I have the right to
  Scenario: I am able to delete a collection only if I have the right to

  Scenario: I don't see Add Collection
  Scenario: I don't see Add index
  Scenario: I can't delete an index
  Scenario: I can see security dongle

  @cleanDb
  Scenario: I can create document only if I have the right to
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on collection "readonly-collection"
    Then I don't see the add document button

  @cleanDb
  Scenario: I can't edit document in collection "readonly-collection"
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on collection "readonly-collection"
    Then I have a list with "1" element
    Then I can't edit the document in position "1"

  @cleanDb
  Scenario: I can't delete document in collection "readonly-collection"
    Given I am on browse data page
    Then I click on the collection selector
    Then I click on collection "readonly-collection"
    Then I have a list with "1" element
    Then I can't delete the document in position "1"

  @cleanDb @unsubscribe
  Scenario: I can't subscribe
    Given I go to the realtime page
    And I click on the collection selector
    Given I click on collection "private-collection"
    And I can't see filter form


  Scenario: I can't publish
    Given I go to the realtime page
    And I click on the collection selector
    Given I click on collection "private-collection"
    And I can't see publish form

  Scenario: Stat widget

  Scenario: Api widget

  Scenario: Empty dashboard


