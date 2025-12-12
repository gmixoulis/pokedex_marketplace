const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const config = getDefaultConfig(__dirname);

// Add CORS and proxy middleware
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, metroServer) => {
    return (req, res, next) => {
      // Set CORS headers for all requests
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Proxy requests to Web3Modal and WalletConnect APIs
      if (req.url.startsWith('/api-proxy/')) {
        const targetUrl = req.url.replace('/api-proxy/', '');
        
        try {
          const parsedUrl = new URL(targetUrl);
          const isHttps = parsedUrl.protocol === 'https:';
          const httpModule = isHttps ? https : http;
          
          // Forward headers from the original request, excluding user-agent
          const forwardHeaders = { ...req.headers };
          delete forwardHeaders['user-agent'];
          delete forwardHeaders['host']; // Don't forward the host header
          delete forwardHeaders['connection'];
          
          // Add necessary headers for the external API
          forwardHeaders['accept'] = forwardHeaders['accept'] || '*/*';
          
      
          
          const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: req.method,
            headers: forwardHeaders
          };

          const proxyReq = httpModule.request(options, (proxyRes) => {
            // Forward status code and headers
            const responseHeaders = {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            };
            
            // Forward content-type if present
            if (proxyRes.headers['content-type']) {
              responseHeaders['Content-Type'] = proxyRes.headers['content-type'];
            }
            
            res.writeHead(proxyRes.statusCode, responseHeaders);

            // Pipe the response
            proxyRes.pipe(res);
          });

          proxyReq.on('error', (error) => {
            console.error('Proxy error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Proxy request failed' }));
          });

          // Forward request body if present
          if (req.method === 'POST' || req.method === 'PUT') {
            req.pipe(proxyReq);
          } else {
            proxyReq.end();
          }
          
          return;
        } catch (error) {
          console.error('Proxy URL parsing error:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid proxy URL' }));
          return;
        }
      }
      
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });