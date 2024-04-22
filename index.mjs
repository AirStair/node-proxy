import { createServer, request } from 'node:http';

const getBody = (incomingMessage, encoding='utf-8') => {
    return new Promise(resolve => {
        let body = [];
        incomingMessage.on('data', chunk => {
            body.push(chunk);
        });
        incomingMessage.on('end', () => {
            const buffer = Buffer.concat(body);
            const content = buffer.toString(encoding);
            resolve(content);
        });
    });
};

export const createProxy = options => proxyOptions => {
    const protocol = 'http:';
    const port = options?.port || 3030;
    const host = options?.host || '127.0.0.1';
    const server = createServer(async (incomingMessage, serverResponse) => {
        const url = incomingMessage.url;
        const option = proxyOptions.find(option => {
            return option.pattern.test(url)
        });
        const encoding = 'utf8';
        if (!option) {
            serverResponse.statusCode = 404;
            serverResponse.end('NO ROUTE', encoding);
            return;
        }
        const match = url.match(option.pattern);
        const groups = match?.groups;
        const path = groups?.path;
        console.table('__INCOMING_MESSAGE__');
        console.table([
            {
                protocol,
                host,
                port,
                method: incomingMessage.method,
            }
        ]);
        console.table({
            path
        });
        console.group();
        const body = await getBody(incomingMessage);
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
            console.log('__SERVER_RESPONSE__');
            console.table([
                {
                    protocol,
                    host: option.host,
                    port: option.port,
                    method: incomingMessage.method,
                    status: response.statusCode
                }
            ]);
            console.table({
                path
            });
            serverResponse.end(body, encoding);
            console.groupEnd();
        });
        clientRequest.end(body, encoding);
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

    server.on('clientError', (error, socket) => {
        console.log(error);
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
};
