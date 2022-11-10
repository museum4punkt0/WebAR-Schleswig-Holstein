const slugify = require('slugify')

module.exports = {
  beforeCreate(event) {
    const { data } = event.params
    if (data.name) {
      data.slug = slugify(data.name, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
        strict: true,
      })
    }
  },
  beforeUpdate(event) {
    const { data } = event.params
    if (data.name) {
      data.slug = slugify(data.name, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
        strict: true,
      })
    }
  },
}
