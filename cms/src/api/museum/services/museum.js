'use strict';

/**
 * museum service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::museum.museum');
