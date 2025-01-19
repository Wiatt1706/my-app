/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'mazrpbjakqosxybtccqi.supabase.co',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist','three']
};

module.exports = nextConfig;
