const JsonReturn = require('../helpers/json-return');

module.exports = async (req, res, next) => {
    const ret = new JsonReturn();
    req.ret = ret;
    next();
};
