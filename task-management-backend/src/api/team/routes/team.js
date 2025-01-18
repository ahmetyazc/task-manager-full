'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/teams',
      handler: 'team.find',
    },
    {
      method: 'GET',
      path: '/teams/:id',
      handler: 'team.findOne',
    },
    {
      method: 'POST',
      path: '/teams',
      handler: 'team.create',
    },
    {
      method: 'PUT',
      path: '/teams/:id',
      handler: 'team.update',
    },
    {
      method: 'DELETE',
      path: '/teams/:id',
      handler: 'team.delete',
    },
  ],
};