const requestHandler = require('../server');

module.exports = (request, response) => {
    return requestHandler(request, response);
};
