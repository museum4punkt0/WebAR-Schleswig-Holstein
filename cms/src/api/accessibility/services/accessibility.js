'use strict';

/**
 * accessibility service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::accessibility.accessibility');
