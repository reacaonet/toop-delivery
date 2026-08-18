const roles = require('./RolesController')
const permissions = require('./PermissionsController')
const users = require('./UsersController')

module.exports = {
  method: {
    permissions,
    roles,
    users,
  }
}
