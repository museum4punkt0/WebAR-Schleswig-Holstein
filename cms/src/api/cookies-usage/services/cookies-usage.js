'use strict';

/**
 * cookies-usage service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cookies-usage.cookies-usage');
