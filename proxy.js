const http = require('http');
const net = require('net');
const url = require('url');

const PORT = process.env.PORT || 8080;

const server = http.createServer();

// Handle HTTP
server.on('request', (req, res) => {
  const parsed = url.parse(req.url);

  const options = {
    hostname: parsed.hostname || req.headers['host'],
    port: parsed.port || 80,
    path: parsed.path || req.url,
    method: req.method,
    headers: req.headers,
  };

  delete options.headers['proxy-connection'];

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end('Bad gateway: ' + err.message);
  });

  req.pipe(proxyReq);
});

// Handle HTTPS (CONNECT)
server.on('connect', (req, clientSocket, head) => {
  const [host, port] = req.url.split(':');
  const serverSocket = net.connect(port || 443, host, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', () => clientSocket.end());
});

server.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
