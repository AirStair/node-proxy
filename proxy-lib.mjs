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
    const protocol = 'http:';
    const port = options?.port || 3030;
    const host = options?.host || '127.0.0.1';
    const server = createServer(async (incomingMessage, serverResponse) => {
        const path = incomingMessage.url;
        const option = proxyOptions.find(option => {
            return option.pattern.test(path)
        });
        if (!option) {
            serverResponse.statusCode = 404;
            serverResponse.end('NO ROUTE');
            return;
        }
        console.table('__INCOMING_MESSAGE__');
        console.table([
            {
                protocol,
                host,
                port,
                path,
                method: incomingMessage.method,
                pattern: option.pattern
            }
        ]);
        console.group();
        const body = await getBody(incomingMessage);
        const content = JSON.parse(body || '{}');
        console.log('__INCOMING_MESSAGE_BODY__');
        console.table([
            content
        ]);

        const clientRequest = request({
            host: option.host,
            port: option.port,
            protocol,
            path,
            method: incomingMessage.method,
            headers: incomingMessage.headers
        }, async response => {
            console.group();
            const body = await getBody(response);
            const content = JSON.parse(body || '{}');
            console.log('__SERVER_RESPONSE__');
            console.table([
                {
                    protocol,
                    host: option.host,
                    port: option.port,
                    path,
                    method: incomingMessage.method,
                    pattern: option.pattern
                }
            ]);
            console.log('__SERVER_RESPONSE_BODY__');
            console.table([
                content
            ]);
            serverResponse.end(body);
            console.groupEnd();
        });
        clientRequest.end(body);
        console.groupEnd();
    });

    server.listen(port, host, () => {
        console.log(`proxy listen http://${host}:${port}`);
        console.table([
            {
                protocol,
                host,
                port
            }
        ]);
    });

    const close = () => {
        server.close(() => {
            console.log(`proxy closed: http://${host}:${port}`);
            console.table([
                {
                    protocol,
                    host,
                    port
                }
            ]);
        });
    };

    process.on('exit', () => {
        close();
    });

    server.on('clientError', error => {
        console.log(error);
        close();
    });
};
