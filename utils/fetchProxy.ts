// Polyfill to intercept fetch calls and proxy Web3Modal/WalletConnect API requests
// This must be imported before any AppKit imports
// Only runs on web platform

if (typeof window !== 'undefined') {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    let url = typeof input === 'string' ? input : input.url;
    
    // Intercept Web3Modal and WalletConnect API calls
    if (url.includes('api.web3modal.org') || url.includes('pulse.walletconnect.org')) {
      // Route through our Metro proxy
      const proxyUrl = `http://localhost:8081/api-proxy/${url}`;
      
      // Preserve all headers except user-agent
      const headers = new Headers(init?.headers || {});
      headers.delete('user-agent');
      headers.delete('User-Agent');
      
      const modifiedInit = {
        ...init,
        headers: Object.fromEntries(headers.entries()),
      };
      
      console.log('Proxying request:', url, '→', proxyUrl);
      console.log('Request headers:', Object.fromEntries(headers.entries()));
      
      try {
        const response = await originalFetch(proxyUrl, modifiedInit);
        console.log('Proxy response status:', response.status);
        return response;
      } catch (error) {
        console.error('Proxy fetch error:', error);
        throw error;
      }
    }
    
    // Pass through all other requests
    return originalFetch(input, init);
  };
}

export { };
