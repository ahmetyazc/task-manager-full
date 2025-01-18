'use strict';

module.exports = {
  async find(ctx) {
    const tasks = await strapi.entityService.findMany('api::project-task.project-task', {
      populate: ['owner', 'team', 'workPackages']
    });
    return { data: tasks };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const task = await strapi.entityService.findOne('api::project-task.project-task', id, {
      populate: ['owner', 'team', 'workPackages']
    });
    return { data: task };
  },

  async create(ctx) {
    const data = ctx.request.body.data;
    const task = await strapi.entityService.create('api::project-task.project-task', {
      data,
      populate: ['owner', 'team', 'workPackages']
    });
    return { data: task };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body.data;
    const task = await strapi.entityService.update('api::project-task.project-task', id, {
      data,
      populate: ['owner', 'team', 'workPackages']
    });
    return { data: task };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    await strapi.entityService.delete('api::project-task.project-task', id);
    return { data: null };
  }
};