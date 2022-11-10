export default {
  config: {
    locales: ['de'],
    translations: {
      de: {
        'app.components.LeftMenu.navbrand.title': 'Landesmuseen SH WebAR',
        'app.components.LeftMenu.navbrand.workplace': 'CMS-Tafel',
      },
      en: {
        'app.components.LeftMenu.navbrand.title': 'Landesmuseen SH WebAR',
        'app.components.LeftMenu.navbrand.workplace': 'CMS Panel',
      },
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false },
  },
  bootstrap(app) {},
}
