/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "dlfp08z7-3000.brs.devtunnels.ms",
      ],
    },
  },
};
