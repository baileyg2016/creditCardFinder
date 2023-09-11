const dotenv = require('dotenv');

const env = process.env.LUNA_ENV;

dotenv.config({ path: `.env.${env}` });

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  swcMinify: true,
};

module.exports = nextConfig;
