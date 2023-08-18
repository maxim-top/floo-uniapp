const path = require('path'); // const extractTextPlugin = require('extract-text-webpack-plugin');
// const indexExtractCss = new extractTextPlugin('css/[name].css');

module.exports = {
  //插件项
  // plugins: [indexExtractCss],
  //页面入口文件配置
  entry: {
    index: './sdk/index.js'
  },
  //入口文件输出配置
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'floo-3.0.0.uniapp.js',
    library: 'floo',
    libraryExport: 'default',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  } // module: {
  //   //加载器配置
  //   loaders: [
  //     { test: /\.css$/, loader: 'style-loader!css-loader' },
  //     { test: /\.js$/, loader: 'jsx-loader?harmony' },
  //     { test: /\.scss$/, loader: 'style!css!sass?sourceMap' },
  //     { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }
  //   ],
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       exclude: /node_modules/,//排除node_modules文件夹下的js
  //       loader: 'babel-loader',
  //     },
  //     {
  //       test: /\.(css)$/,
  //       use: indexExtractCss.extract({
  //         fallback: "style-loader",
  //         use: [
  //           {
  //             loader: "css-loader",
  //           },
  //         ]
  //       })
  //     }
  //   ]
  // },
};
