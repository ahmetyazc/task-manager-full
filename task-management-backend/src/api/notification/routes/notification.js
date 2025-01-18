'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/notifications',
      handler: 'notification.find',
    },
    {
      method: 'GET',
      path: '/notifications/:id',
      handler: 'notification.findOne',
    },
    {
      method: 'POST',
      path: '/notifications',
      handler: 'notification.create',
    },
    {
      method: 'PUT',
      path: '/notifications/:id',
      handler: 'notification.update',
    },
    {
      method: 'DELETE',
      path: '/notifications/:id',
      handler: 'notification.delete',
    },
  ],
};