/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com']
  }
};

module.exports = nextConfig;
