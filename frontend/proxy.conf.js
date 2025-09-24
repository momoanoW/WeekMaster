const PROXY_CONFIG = [
  {
    context: ['/api/**'],
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: function (proxyReq, req, res) {
      console.log(`[PROXY] ${req.method} ${req.originalUrl} -> http://localhost:3000${req.originalUrl}`);
      
      // Stelle sicher, dass Content-Type gesetzt ist für PATCH/POST/PUT
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        proxyReq.setHeader('Content-Type', 'application/json');
      }
    },
    onProxyRes: function (proxyRes, req, res) {
      console.log(`[PROXY] Response ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
    },
    onError: function (err, req, res) {
      console.log('[PROXY ERROR]', err.message);
    }
  }
];

module.exports = PROXY_CONFIG;
