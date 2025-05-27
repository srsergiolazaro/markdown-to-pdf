/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignorar archivos .map
    config.module.rules.push({
      test: /\.map$/,
      use: 'ignore-loader'
    });

    // Configuración específica para chrome-aws-lambda
    if (isServer) {
      config.externals.push({
        'chrome-aws-lambda': 'chrome-aws-lambda',
        'puppeteer-core': 'puppeteer-core'
      });
    }

    return config;
  }
};

module.exports = nextConfig; 