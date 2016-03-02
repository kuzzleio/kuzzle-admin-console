angular.module('kuzzle.realtime')
.service('messageNotification', [function () {
  return {
    notificationToMessage: function (notification) {
      var messageItem = {
        id:  notification.result._id,
        text: '',
        icon: 'file',
        class: '',
        source:  {
            source: notification.result._source,
            metadata: notification.metadata
        },
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
          messageItem.icon = 'file';

          if (notification.state === 'done') {
            messageItem.text = 'Created new document';
            messageItem.class = 'message-created-updated-doc';
          } else if (notification.state === 'pending') {
            messageItem.text = 'Creating new document';
            messageItem.class = 'message-pending';
          }
        break;

        case 'update':
          messageItem.text = 'Updated document';
          messageItem.icon = 'file';
          messageItem.class = 'message-created-updated-doc';
        break;

        case 'delete':
          messageItem.icon = 'remove';
          messageItem.canEdit = false;
          if (notification.state === 'done') {
            messageItem.text = 'Deleted document';
            messageItem.class = 'message-deleted-doc';
          } else if (notification.state === 'pending') {
            messageItem.text = 'Deleting document';
            messageItem.class = 'message-pending';
          }
        break;

        case 'on':
          messageItem.text = 'A new user is listening to this room';
          messageItem.icon = 'user';
          messageItem.class = 'message-user';
          messageItem.canEdit = false;
          messageItem.source = notification.metadata;
        break;

        case 'off':
          messageItem.text = 'A user exited this room';
          messageItem.icon = 'user';
          messageItem.class = 'message-user';
          messageItem.source = notification.metadata;
          messageItem.canEdit = false;
        break;

        default:
          throw 'Unknown notification';
      }

      return messageItem;
    }
  };
}]);
