const path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.min.js',
    sourceMapFilename: 'main.min.map'
  },
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'raw-loader'
      }
    ]
  },
  devServer: {
    contentBase: './build'
  },
  plugins: [new HtmlWebpackPlugin()]
}
