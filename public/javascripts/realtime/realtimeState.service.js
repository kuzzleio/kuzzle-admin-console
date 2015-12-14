angular.module('kuzzle.realtime')
.factory('watchDataForms', [ function () {
  var comparators = [
    {
      label: 'is equal to',
      value: true
    },
    {
      label: 'is not equal to',
      value: false
    }
  ];

  var firstMessage = {
    class: 'text-muted',
    icon: 'info-sign',
    text: 'This is your message log. Here, you will see the notifications coming from the collection you have subscribed to. Use the filters on the right to start a subscription.'
  };

  return {
    comparators: comparators,
    filter: {
      basicFilter: [{
        and: [
          {field: null, equal: comparators[0], value: null}
        ]
      }],
      advancedFilter: ''
    },
    forms: {},
    searchType: {},
    collections: [],
    collection: null,
    documents: [],
    messageToPublish: '',
    messages: [firstMessage]
  }
}]);
