const slugify = require('slugify')

module.exports = {
  beforeCreate(event) {
    const { data } = event.params
    if (data.title) {
      data.slug = slugify(data.title, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
        strict: true,
      })
    }
  },
  beforeUpdate(event) {
    const { data } = event.params
    if (data.title) {
      data.slug = slugify(data.title, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
        strict: true,
      })
    }
  },
}
