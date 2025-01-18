'use strict';

module.exports = {
  async find(ctx) {
    const packages = await strapi.entityService.findMany('api::work-package.work-package', {
      populate: ['project_task']
    });
    return { data: packages };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const package = await strapi.entityService.findOne('api::work-package.work-package', id, {
      populate: ['project_task']
    });
    return { data: package };
  },

  async create(ctx) {
    const data = ctx.request.body.data;
    const package = await strapi.entityService.create('api::work-package.work-package', {
      data,
      populate: ['project_task']
    });
    return { data: package };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body.data;
    const package = await strapi.entityService.update('api::work-package.work-package', id, {
      data,
      populate: ['project_task']
    });
    return { data: package };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    await strapi.entityService.delete('api::work-package.work-package', id);
    return { data: null };
  }
};