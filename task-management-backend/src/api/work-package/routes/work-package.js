'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/work-packages',
      handler: 'work-package.find',
    },
    {
      method: 'GET',
      path: '/work-packages/:id',
      handler: 'work-package.findOne',
    },
    {
      method: 'POST',
      path: '/work-packages',
      handler: 'work-package.create',
    },
    {
      method: 'PUT',
      path: '/work-packages/:id',
      handler: 'work-package.update',
    },
    {
      method: 'DELETE',
      path: '/work-packages/:id',
      handler: 'work-package.delete',
    },
  ],
};