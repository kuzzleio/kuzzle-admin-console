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
        expanded: false
      };

      switch (notification.action) {
        case 'create':
        case 'createOrUpdate':
          messageItem.text = 'Created new document';
          messageItem.icon = 'file';
          messageItem.class = 'text-primary';
        break;

        case 'update':
          messageItem.text = 'Updated document';
          messageItem.icon = 'file';
          messageItem.class = 'text-primary';
        break;

        case 'delete':
          messageItem.text = 'Deleted document';
          messageItem.icon = 'remove';
          messageItem.class = 'text-muted';
        break;
      };

      return messageItem;
    }
  }
}]);
