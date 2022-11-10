'use strict';

/**
 * station service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::station.station');
