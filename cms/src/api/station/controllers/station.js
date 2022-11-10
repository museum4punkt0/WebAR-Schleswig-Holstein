'use strict'

/*
 *  station controller
 */

const { createCoreController } = require('@strapi/strapi').factories

// Default controller export:
module.exports = createCoreController('api::station.station')

// Custom controller export, that adds auto-populate of component data:
// eslint-disable-next-line no-unused-vars
module.exports = createCoreController('api::station.station', ({ strapi }) => ({
  async find(ctx) {
    const populateList = [
      'header',
      'image',
      'map_image',
      'dgs_video',
      'audio_description',
      'station_content',
      'station_content.image',
      'station_content.introduction',
      'station_content.audio_player',
      'station_content.audio',
      'station_content.extra_info',
      'station_content.paragraph',
      'station_content.image_gallery.image',
      'station_content.single_image.image',
      'station_content.video',
      'station_content.quiz_answer',
      'ar_experience',
      'ar_experience.usdz_file',
      'ar_experience.glb_gltf_file',
      'ar_experience.sound',
      'museum',
      'museum.localizations',
      'localizations',
    ]
    // Push any additional query params to the array
    populateList.push(ctx.query.populate)
    ctx.query.populate = populateList.join(',')

    const content = await super.find(ctx)
    return content
  },
}))
