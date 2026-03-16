import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const requestHandler = require('../server.js');

export default function handler(request, response) {
    return requestHandler(request, response);
}
