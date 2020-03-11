const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const WebpackBar = require('webpackbar');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const { HMR_PATH } = require('./scripts/utils/constance');
// const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isProd = process.env.NODE_ENV === 'production';
const ROOT_PATH = __dirname;
const project = '';

function resolve(...dir) {
  return path.resolve(ROOT_PATH, ...dir);
}

const projectPath = resolve('src', project);
const outputPath = resolve('dist', project);
// const publicPath = `/${project}/`;
const publicPath = `/`;
// const favicon = /* resolve(projectPath, 'images/favicon.jpg') */ undefined;
const { entry, htmlPlugins } = resolveEntries();

let webpackConfig = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? 'hidden-source-map' : 'eval-source-map',
  entry,
  output: {
    path: outputPath,
    publicPath,
    filename: isProd ? 'static/[name].[chunkhash].js' : 'static/[name].js',
  },
  module: {
    rules: generateRules()
  },
  plugins: [
    ...htmlPlugins,
    new WebpackBar(),
    new FriendlyErrorsPlugin(),
    // new HardSourceWebpackPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json','.vue'],
    alias: {
      // 若在非js文件内使用应为 '~ROOT/xxx', 利用webpack会视'~'为模块解析
      'ROOT': ROOT_PATH,
      '@': projectPath,
      'vue$': 'vue/dist/vue.js',
    }
  },
  performance: {
    hints: isProd ? 'warning' : false // 当打包的文件大于 244 KiB 是会在提出警告
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor', // 与 output.filename 一致, 即为 'vendor.[chunckhash].js'
          chunks: 'initial',// 如果代码中有异步组件时, 若设置为 'all' 会因找不到模块而报错
          test: /node_modules/,
          enforce: true
        },
        styles: {
          // 提取公用的css, 前提文件名必须是 (reset|common).(le|c|sc|sa)ss, 且必须在 .js 文件中显式 import
          name: 'vendor',
          chunks: 'all',
          test: /[/\\](reset|common)\.(le|c|sc|sa)ss$/,
          enforce: true
        },
      }
    },
  }
};

if (isProd) {
  webpackConfig = merge(webpackConfig, {
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: 'static/[name].[contenthash].css',
        chunkFilename: 'static/[id].[contenthash].css'
      })
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new OptimizeCSSAssetsPlugin(),
        new UglifyJsPlugin({
          test: /\.js$/,
          exclude: /\/node_modules/,
          // cache: './dist/.cache',
          parallel: true,
          uglifyOptions: {
            compress: {
              drop_console: true
            }
          }
        }),
      ]
    }
  });
} else {
  webpackConfig = merge(webpackConfig, {
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
      new webpack.NoEmitOnErrorsPlugin(),
    ]
  });
}

// 获取人口文件和对应的html
function resolveEntries() {
  const jsDir = resolve(projectPath, 'js');
  const htmlDir = resolve(projectPath, 'views');
  const entry = {};
  const htmlPlugins = [];

  fs.readdirSync(jsDir).forEach(file => {
    const filename = file.match(/(.+)\.(js|ts)x?$/)[1];
    const htmlname = `${filename}.html`;
    // const html = resolve(htmlDir, htmlname);

    entry[filename] = [
      ...(isProd ? [] : [ `webpack-hot-middleware/client?path=${HMR_PATH}` ]),// html hot-reload
      resolve(jsDir, file)
    ];

    htmlPlugins.push(
      new HtmlWebpackPlugin({
        template: resolve(htmlDir, htmlname),
        filename: htmlname,
        // favicon: favicon,
        chunks: ['vendor', filename],
      })
    );
  });

  return {
    entry,
    htmlPlugins
  };
}

function generateRules() {
  return [
    {
      test: /\.(js|tsx)?$/,
      use: [
        { loader: 'babel-loader', options: { cacheDirectory: true } },
        'ts-loader',
        // 'eslint-loader',
      ],
      exclude: /node_modules/
    },
    {
      test: /\.html$/,
      use: {
        loader: 'html-loader',
        options: {
          minimize: isProd,
          removeAttributeQuotes: false,
        }
      }
    },
    {
      test: /\.(c|le)ss$/,
      // exclude: /node_modules/,
      use: [
        isProd ? MiniCssExtractPlugin.loader : 'style-loader',
        'css-loader',
        'postcss-loader',
        'less-loader'
      ]
    },
    {
      test: /\.(jpg|png|gif|bmp)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10 * 1024,
          name: isProd ? 'static/[hash].[ext]' : 'static/[name].[hash].[ext]'
        }
      }
    },
    {
      test: /\.(eot|otf|svg|ttf|woff|woff2)\w*/,
      use: {
        loader: 'file-loader',
        options: {
          name: isProd ? '[hash].[ext]' : '[name].[hash].[ext]',
          outputPath: 'static/',
          publicPath: isProd ? './' : undefined
        }
      },
    }
  ];
}

module.exports = webpackConfig;