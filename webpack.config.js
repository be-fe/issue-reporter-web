const path = require('path')
const webpack = require('webpack')
const capitalize = require('lodash.capitalize')
const { name } = require('./package')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const watch = !!process.env.WATCH
const isExample = !!process.env.EXAMPLE

function conf({ define, isBuild, globalObject, watch, externals, mini, suffix = '', format } = {}) {
  const NODE_ENV = isBuild ? 'production' : 'development'
  const filename = `${name}${suffix}.${format}${mini ? '.min' : ''}.js`
  return {
    name: filename,
    mode: NODE_ENV,
    entry: isExample ? './example.js' : ['./standalone.js', './src/style.less'],
    target: format === 'commonjs2' ? 'node' : 'web',
    externals:
      format === 'commonjs2'
        ? [
            function(context, request, callback) {
              if (['.less', '.css', '.sass'].includes(path.extname(request))) {
                return callback()
              }
              const dep = Object.keys(require('./package').dependencies).concat(
                Object.keys(require('./package').peerDependencies)
              )
              const f = dep.find(name => request.startsWith(name))
              if (f) {
                return callback(null, 'commonjs ' + request)
              }
              callback()
            }
          ].concat(externals)
        : externals,
    output: {
      globalObject,
      path: path.resolve(__dirname, 'dist'),
      filename,
      library: !isExample
        ? {
            root: capitalize(name),
            amd: name,
            commonjs: name
          }
        : void 0,
      libraryTarget: !isExample ? format : void 0
    },
    resolve: {
      alias: {
        react: 'preact-compat',
        'react-dom': 'preact-compat',
        // Not necessary unless you consume a module using `createClass`
        'create-react-class': 'preact-compat/lib/create-react-class',
        // Not necessary unless you consume a module requiring `react-dom-factories`
        'react-dom-factories': 'preact-compat/lib/react-dom-factories'
      }
    },
    devtool: 'cheap-source-map',
    module: require('./webpack.module'),
    plugins: [
      isExample &&
        new HtmlWebpackPlugin({
          templateParameters: {},
          template: './example.html',
          filename: 'index.html'
        }),
      new ExtractTextPlugin({
        filename: 'style.css',
        allChunks: false
      }),
      new webpack.DefinePlugin(
        Object.assign(
          {
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
          },
          define
        )
      ),
      // !isBuild && watch && new webpack.HotModuleReplacementPlugin(),
      isBuild &&
        !isExample &&
        !watch &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static'
        })
    ].filter(Boolean),

    watch
  }
}

module.exports = [
  watch
    ? conf({
        watch: watch,
        isBuild: false,
        format: 'umd'
      })
    : conf({
        watch: watch,
        isBuild: true,
        format: 'umd'
      })
].filter(Boolean)
