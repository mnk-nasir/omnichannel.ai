/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  async rewrites() {
    let gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3000';
    // Ensure URL always has a protocol prefix
    if (!gatewayUrl.startsWith('http://') && !gatewayUrl.startsWith('https://')) {
      gatewayUrl = 'https://' + gatewayUrl;
    }
    return [
      {
        source: '/api/:path*',
        destination: `${gatewayUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
