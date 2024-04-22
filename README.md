![node-proxy-lib](icon.png "node-proxy-lib")

# node-proxy-lib
node.js proxy server

```
npm i node-proxy-lib
```

```js
import { createProxy } from 'node-proxy-lib';

const proxy = createProxy();

proxy([
    {
        pattern: /(?<path>api\/.+)/,
        host: '127.0.0.1',
        port: 8081
    },
    {
        pattern: /(?<path>.+)/,
        host: '127.0.0.1',
        port: 8080
    }
]);
```
