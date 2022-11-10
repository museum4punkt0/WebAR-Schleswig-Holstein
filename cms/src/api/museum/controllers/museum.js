'use strict'

/**
 *  museum controller
 */

const { createCoreController } = require('@strapi/strapi').factories

// Default controller export:
module.exports = createCoreController('api::museum.museum')

// Custom controller export, that adds auto-populate of component data:
// eslint-disable-next-line no-unused-vars
module.exports = createCoreController('api::museum.museum', ({ strapi }) => ({
  async find(ctx) {
    const populateList = [
      'logo',
      'welcome_image',
      'stations',
      'stations.image',
      'stations.map_image',
      'welcome_page',
      'welcome_page.dgs_video',
      'welcome_page.audio_description',
      'footer',
      'footer.info_link',
      'localizations',
    ]
    // Push any additional query params to the array
    populateList.push(ctx.query.populate)
    ctx.query.populate = populateList.join(',')

    const content = await super.find(ctx)
    return content
  },
}))
