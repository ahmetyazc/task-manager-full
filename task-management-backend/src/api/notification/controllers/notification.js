'use strict';

module.exports = {
  async find(ctx) {
    const notifications = await strapi.entityService.findMany('api::notification.notification', {
      populate: ['user']
    });
    return { data: notifications };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const notification = await strapi.entityService.findOne('api::notification.notification', id, {
      populate: ['user']
    });
    return { data: notification };
  },

  async create(ctx) {
    const data = ctx.request.body.data;
    const notification = await strapi.entityService.create('api::notification.notification', {
      data,
      populate: ['user']
    });
    return { data: notification };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body.data;
    const notification = await strapi.entityService.update('api::notification.notification', id, {
      data,
      populate: ['user']
    });
    return { data: notification };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    await strapi.entityService.delete('api::notification.notification', id);
    return { data: null };
  }
};