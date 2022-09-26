const roles = require('../config/roles');

isAuthorized = (req, res, next) => {
  let {userData = {}, permission = 'noPermission' } = res.locals || {}
  let { permissions = {}} = userData;
  let { module = 'noModule', action = 'noAction' } = roles[permission] || {};

  if (permissions[module] && permissions[module][action]) {
    next()
  } else {
    let moduleName = module.replace("_", " ");
    moduleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    return res.status(403).send(tools.dynamicMsg(error['privilegeError'], [moduleName, action], []));
  }
}

module.exports = isAuthorized;