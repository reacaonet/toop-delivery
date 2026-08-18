const auth = require('./AuthController')
const refresh = require('./RefreshController')

module.exports = {
    method: {
        auth,
        refresh,
    }
}