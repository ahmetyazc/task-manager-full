'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/project-tasks',
      handler: 'project-task.find',
    },
    {
      method: 'GET',
      path: '/project-tasks/:id',
      handler: 'project-task.findOne',
    },
    {
      method: 'POST',
      path: '/project-tasks',
      handler: 'project-task.create',
    },
    {
      method: 'PUT',
      path: '/project-tasks/:id',
      handler: 'project-task.update',
    },
    {
      method: 'DELETE',
      path: '/project-tasks/:id',
      handler: 'project-task.delete',
    },
  ],
};