# node-proxy
nodejs proxy server

`
import { createProxy } from './proxy-lib.mjs';

const proxy = createProxy({
    host: '127.0.0.1',
    port: 3030
});

proxy([
    {
        pattern: /\/ssr\/.*/,
        host: '127.0.0.1',
        port: 8080
    },
    {
        pattern: /\/gateway\/.+/,
        host: '127.0.0.1',
        port: 8081
    }
]);

`
