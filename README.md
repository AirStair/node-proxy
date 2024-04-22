![proxy-lib](icon.png "proxy-lib")

# node-proxy
nodejs proxy server

```sh
npm i node-proxy-lib
```

```js
import { createProxy } from 'proxy-lib';

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
```
