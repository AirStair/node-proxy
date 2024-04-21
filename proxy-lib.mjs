import { createServer, request } from 'node:http';

const getBody = incomingMessage => {
    return new Promise(resolve => {
        let body = '';
        incomingMessage.on('data', chunk => {
            body += chunk;
        });
        incomingMessage.on('end', () => {
            resolve(body);
        });
    });
};

export const createProxy = options => proxyOptions => {
    const server = createServer(async (incomingMessage, serverResponse) => {
        const path = incomingMessage.url;
        const option = proxyOptions.find(option => {
            return option.pattern.test(path)
        });
        if (!option) {
            serverResponse.statusCode = 404;
            serverResponse.end('no route');
            return;
        }
        const currentRequest = request({
            host: option.host,
            port: option.port,
            protocol: 'http:',
            path,
            method: incomingMessage.method,
            headers: incomingMessage.headers
        }, async response => {
            const body = await getBody(response);
            serverResponse.end(body);
        });
        const body = await getBody(incomingMessage);
        currentRequest.end(body);
    });

    const port = options?.port || 3030;
    const host = options?.host || '127.0.0.1';

    server.listen(port, host, () => {
        console.log(`proxy listen http://${host}:${port}`);
    });

    process.on('exit', () => {
        server.close(() => {
            console.log(`proxy closed: http://${host}:${port}`);
        });
    });
};
