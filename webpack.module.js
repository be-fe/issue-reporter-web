/**
 * @file webpack.module.js
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2018/11/7
 *
 */
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins(/*loader*/) {
      return [
        require('autoprefixer')({ remove: false, browsers: ['cover 99.5%'] }),
        require('cssnano')({
          zindex: false,
          // https://github.com/ben-eb/cssnano/issues/361
          reduceIdents: false
        })
      ]
    }
  }
}

module.exports = {
  // noParse: //,
  // 关于模块配置
  rules: [
    {
      test: /\.jsx?$/,
      include: [__dirname],
      exclude: [/node_modules/],
      loader: 'babel-loader',
      options: {
        plugins: [
          // ['transform-react-jsx', { pragma: 'React.h' }],
          [
            'transform-async-to-generator',
            'module-resolver',
            {
              root: ['.'],
              alias: {
                react: 'preact-compat',
                'react-dom': 'preact-compat',
                // Not necessary unless you consume a module using `createClass`
                'create-react-class': 'preact-compat/lib/create-react-class',
                // Not necessary unless you consume a module requiring `react-dom-factories`
                'react-dom-factories': 'preact-compat/lib/react-dom-factories'
              }
            }
          ]
        ]
      }
      // loader 的可选项
    },
    {
      test: /\.less$/,
      // include: ['node_modules/**'],
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            options: {
              // url: false,
              minimize: true,
              sourceMap: true
            }
          },
          postcssLoader,
          {
            loader: 'less-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      })
    },
    {
      test: /\.css$/,
      // include: ['node_modules/**'],
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            options: {
              // url: false,
              minimize: true,
              sourceMap: true
            }
          },
          postcssLoader
        ]
      })
    },
    {
      test: /\.png$/,
      // include: ['node_modules/**'],
      use: {
        loader: 'url-loader',
        options: {
          // url: false,
          limit: Infinity
        }
      }
    }
    // 条件不匹配时匹配
  ]
}
