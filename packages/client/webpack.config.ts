import { resolve } from 'path';
import webpack from 'webpack';
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config();

module.exports = () => {

//   const env = dotenv.config().parsed;

//   const envKeys = Object.keys(env).reduce((prev: any, next: any) => {
//     prev[`process.env.${next}`] = JSON.stringify(env[next]);
//     return prev;
//   }, {});

  const isProd = process.env.NODE_ENV === "production";

  return {
    mode: isProd ? "production" : "development",
    entry: {
      index: "./src/index.tsx",
    },
    output: {
      path: resolve(__dirname, "dist"),
      filename: "luna.bundle.js",
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    module: {
      rules: [
        {
          test: /\.(js|ts)x?$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          exclude: /node_modules/
        },
        {
          test: /\.(png|j?g|svg|gif|eot|ttf|woff|woff2)?$/,
          use: 'file-loader'
        },
      ],
    },
    // presets: ["@babel/preset-react"],
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        filename: "index.html",
        inject: "body",
      }),
    //   new webpack.DefinePlugin(envKeys)
    ],
    devServer: {
      port: 3000,
      open: true,
      hot: true,
      compress: true,
      stats: 'errors-only',
      overlay: true,
    }
  }
};