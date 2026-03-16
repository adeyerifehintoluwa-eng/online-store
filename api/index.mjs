import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const requestHandler = require('../server.js');

export default function handler(request, response) {
    const url = new URL(request.url, 'http://localhost');
    const routedPath = Array.isArray(request.query?.path)
        ? request.query.path.join('/')
        : (request.query?.path || url.searchParams.get('path') || '');

    if (routedPath) {
        url.searchParams.delete('path');
        const normalizedPath = String(routedPath).replace(/^\/+/, '');
        const queryString = url.searchParams.toString();
        request.url = `/api/${normalizedPath}${queryString ? `?${queryString}` : ''}`;
    }

    return requestHandler(request, response);
}
