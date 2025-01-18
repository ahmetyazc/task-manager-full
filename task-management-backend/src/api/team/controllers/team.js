'use strict';

module.exports = {
  async find(ctx) {
    const teams = await strapi.entityService.findMany('api::team.team', {
      populate: ['project_tasks']
    });
    return { data: teams };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const team = await strapi.entityService.findOne('api::team.team', id, {
      populate: ['project_tasks']
    });
    return { data: team };
  },

  async create(ctx) {
    const data = ctx.request.body.data;
    const team = await strapi.entityService.create('api::team.team', {
      data,
      populate: ['project_tasks']
    });
    return { data: team };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body.data;
    const team = await strapi.entityService.update('api::team.team', id, {
      data,
      populate: ['project_tasks']
    });
    return { data: team };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    await strapi.entityService.delete('api::team.team', id);
    return { data: null };
  }
};