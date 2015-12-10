angular.module('kuzzle.realtime')
.service('notification', [function () {
  return {
    notificationToMessage: function (notification) {
      var messageItem = {
        id:  notification._id,
        text: '',
        icon: 'file',
        class: '',
        source: angular.toJson(notification._source, 4),
        expanded: false,
        canEdit: true
      };

      switch (notification.action) {
        case 'publish':
          messageItem.text = 'Received volatile message';
          messageItem.icon = 'send';
          messageItem.class = 'message-volatile';
          messageItem.canEdit = false;
        break;
        case 'create':
        case 'createOrUpdate':
          messageItem.text = 'Created new document';
          messageItem.icon = 'file';
          messageItem.class = 'message-created-updated-doc';
        break;

        case 'update':
          messageItem.text = 'Updated document';
          messageItem.icon = 'file';
          messageItem.class = 'message-created-updated-doc';
        break;

        case 'delete':
          messageItem.text = 'Deleted document';
          messageItem.icon = 'remove';
          messageItem.class = 'message-deleted-doc';
          messageItem.canEdit = false;
        break;
      };

      return messageItem;
    }
  }
}]);
