/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['cesium'],
  webpack: (config) => {
    // Add support for Cesium
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/cesium/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    });

    return config;
  },
  // Define environment variables for Cesium base URL
  env: {
    CESIUM_BASE_URL: '/static'
  }
};

export default nextConfig;

