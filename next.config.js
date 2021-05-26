require('dotenv').config();
const withOffline = require('next-offline');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const PreloadWebpackPlugin = require('preload-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const apiPath = `^${process.env.API_URL}`;

const workboxOpts = {
  clientsClaim: true,
  skipWaiting: true,
  modifyURLPrefix: {
    '.next': '/_next',
  },
  swDest: '../public/service-worker.js',

  runtimeCaching: [
    {
      urlPattern: new RegExp(`^(?:https://)(?:localhost|${(process.env.SELF_URL || 'eventmate').toLowerCase()}).*`),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'app-cache',
        cacheableResponse: {
          statuses: [200],
        },
      },
    },
    {
      urlPattern: new RegExp(apiPath),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'request-cache',
        cacheableResponse: {
          statuses: [200],
        },
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 5 * 60, // 30 Days
          purgeOnQuotaError: true,
        },
      },
    },
    {
      urlPattern: new RegExp('^https://fonts.gstatic.com/'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-cache',
        cacheableResponse: {
          statuses: [200],
        },
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 5 * 60, // 30 Days
          purgeOnQuotaError: true,
        },
      },
    },
    {
      urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'image-cache',
        cacheableResponse: {
          statuses: [200],
        },
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          purgeOnQuotaError: true,
        },
      },
    },
  ],
};

const manifest = new WebpackPwaManifest({
  filename: 'static/manifest.json',
  name: process.env.SITE_TITLE,
  short_name: process.env.SITE_TITLE,
  description: process.env.SITE_DESC || '',
  background_color: '#ffffff',
  theme_color: '#492b23',
  display: 'standalone',
  orientation: 'portrait',
  fingerprints: false,
  inject: false,
  start_url: '/',
  ios: {
    'apple-mobile-web-app-title': process.env.SITE_TITLE,
    'apple-mobile-web-app-status-bar-style': '#492b23',
  },
  icons: [
    {
      src: path.resolve(path.join(__dirname, process.env.FILESPACE, '/favicon.png')),
      sizes: [96, 128, 180, 192, 256, 384],
      destination: '/static/appicons/',
      purpose: 'any maskable',
    },
  ],
  includeDirectory: true,
  publicPath: '..',
});

module.exports = withBundleAnalyzer(withOffline({
  workboxOpts,
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.plugins.push(...[manifest]);
    }
    config.plugins.push(new LodashModuleReplacementPlugin({}));
    config.resolve.alias.namespace = path.join(__dirname, process.env.NAMESPACE);
    return config;
  },
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
    FILESPACE: process.env.FILESPACE,
    SITE_TITLE: process.env.SITE_TITLE,
    NODE_ENV: process.env.NODE_ENV,
    GFONT_URL: process.env.GFONT_URL,
    BRAND_TITLE: process.env.BRAND_TITLE,
    SELF_URL: process.env.SELF_URL,
    PORT: process.env.PORT,
    SITE_ENV: process.env.SITE_ENV,
  },
  useFileSystemPublicRoutes: false,

  // images: {
  //   domains: [],
  // },
  compress: true,
}));
