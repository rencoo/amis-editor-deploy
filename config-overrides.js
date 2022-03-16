const path = require('path');
const {
  override,
  disableEsLint
} = require('customize-cra');
const paths = require('react-scripts/config/paths');
const chalk = require('chalk');

// webpack plugins
const CopyPlugin = require('copy-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const rewireHtmlWebpackPlugin = require('react-app-rewire-html-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 自定义环境变量REACT_APP_ENV配置
(function () {
  for (let i = 0, len = process.argv.length; i < len; i += 1) {
    if (process.argv[i].indexOf('--') === 0) {
      let item = process.argv[i]
        .substring('--'.length, process.argv[i].length)
        .split('=');
      process.env[item[0]] = item[1];
    }
  }
})();

// NOTE: 放在上面种环境变量的逻辑下方
const devMode = process.env.REACT_APP_ENV !== 'prod';
// NOTE: 生产环境的路径可以根据需要修改
const publicPath = devMode ? '/' : '/amis-editor/dist/';
// 这些资源是官方amis-editor-demo里入口页面用到的
const cdn4Html = {
  css: [
    {
      href: publicPath + '@fortawesome/fontawesome-free/css/all.css',
      rel: 'stylesheet'
    },
    {
      href: publicPath + '@fortawesome/fontawesome-free/css/v4-shims.css',
      rel: 'stylesheet'
    },
    {
      href: publicPath + 'amis/lib/themes/default.css',
      rel: 'stylesheet'
    },
    {
      href: publicPath + 'amis-editor/dist/style.css',
      rel: 'stylesheet'
    },
    {
      href: publicPath + 'style.css',
      rel: 'stylesheet'
    },
    // icon and manifest
    {
      href: publicPath + 'logo192.png',
      rel: 'apple-touch-icon'
    },
    {
      href: publicPath + 'manifest.json',
      rel: 'manifest'
    }
  ]
}

// map打包
// process.env.GENERATE_SOURCEMAP =
//   devMode ? 'false' : 'true';

// progress 进度条插件
const customPlugins = [
  ProgressBarPlugin({
    width: 60,
    format:
      `${chalk.green('build')} [ ${chalk.cyan(':bar')} ]` +
      ` ${chalk.cyan(':msg')} ${chalk.red('(:percent)')}`,
    clear: true
  }),
  // 拷贝无需构建的资源到最终构建目录
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(
          __dirname,
          './node_modules/@fortawesome/fontawesome-free'
        ),
        to: './@fortawesome/fontawesome-free'
      },
      {
        from: path.resolve(__dirname, './node_modules/amis/lib/themes/default.css'),
        to: './amis/lib/themes/default.css'
      },
      {
        from: path.resolve(__dirname, './node_modules/amis-editor/dist/style.css'),
        to: './amis-editor/dist/style.css'
      }
    ]
  }),
  new FilterWarningsPlugin({
    exclude: /Failed to parse source map/
  })
];

// 修改构建结果路径(默认是/build目录下)
const staticFile = 'dist';
paths.appBuild = path.join(path.dirname(paths.appBuild), staticFile);

// 本地开发代理服务器解决跨域问题
/**
const devServerConfig = () => (config) => {
  return {
      ...config,
      compress: true, // 服务开启gzip
      proxy: {
          '/': {
              target: 'http://192.168.100.118:8808/api',
              changeOrigin: true,
              pathRewrite: {
                  '^/': '/',
              },
          },
      },
  };
};
*/

module.exports = {
  webpack: override(
    disableEsLint(), //忽略eslint警告
    // 设置路径别名(typescript时有问题)
    // addWebpackAlias({
    //   '@': path.join(__dirname, '/src'),
    //   '@util': path.join(__dirname, '/src/utils'),
    //   '@store': path.join(__dirname, '/src/store')
    // }),
    (config) => {
      config.name = 'amis editor';
      // config.stats.warningsFilter
      // ignoreWarnings
      // 本地开发无需设置
      if (!devMode) {
        config.output.path = path.join(
          path.dirname(config.output.path || '/'),
          staticFile
        );
        config.output.publicPath = publicPath;
        config.output.chunkFilename = 'chunk_[name].[chunkhash:8].js';

        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            libs: {
              name: 'chunk-libs',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              chunks: 'initial' // only package third parties that are initially dependent
            },
            amis: {
              name: 'chunk-amis', // split amis into a single package
              priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
              test: /[\\/]node_modules[\\/]_?amis(.*)/ // in order to adapt to cnpm
            },
            antd: {
              name: 'chunk-antd',
              priority: 30,
              test: /[\\/]node_modules[\\/]_?antd(.*)/ // in order to adapt to cnpm
            }
          }
        };
      }
      config.plugins = [...config.plugins, ...customPlugins];

      const overrideConfig = {
        // chunks: [],
        template: path.resolve(__dirname, './public/index.html'),
        filename: devMode ? 'index.html' : '../../../views/editor.hbs', // NOTE: 生产环境按照需要将入口页面输出到目标路径
        // publicPath: publicPath, // 控制不了runtime插入的
        // inject: true,
        cdn: cdn4Html
      };
      config = rewireHtmlWebpackPlugin(config, null, overrideConfig)
      return config;
    }
  )
  // 本地开发时代理服务器配置
  // devServer: overrideDevServer(devServerConfig()),
};
