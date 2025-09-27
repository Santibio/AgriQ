/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: `/${process.env.CLOUDINARY_NAME}/**`, // Replace 'your-cloud-name' with your actual Cloudinary cloud name.
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'dlfp08z7-3000.brs.devtunnels.ms'],
      bodySizeLimit: '10mb',
    },
  },
}
