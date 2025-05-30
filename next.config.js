// next.config.js
const path = require('path')

module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias['@components'] = path.join(__dirname, 'components')
    return config
  },
}
