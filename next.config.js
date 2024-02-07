/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil'
    });

    return config;
  },
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com']
  }
};

module.exports = nextConfig;
