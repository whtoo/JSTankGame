const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode : 'development',
    entry: {
        game: "./src/extreem-engine.js", 
    },
    devtool: 'inline-source-map',
    output: {
        path : path.resolve(__dirname,'dist'),
        filename: '[name].js'
    },
    devServer: {
        contentBase : './dist',
    },
    plugins:[
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            title: 'Tank Battles in ES6',
            template: 'src/index.html', // 源模板文件
            filename: './index.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
            showErrors: true,
            inject: 'body',
        })
    ],
    module: {
        rules: [{
            test: /\.js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/env']  // 也可以写成presets:['babel-preset-env']
              }
            },
            exclude: '/node_modules/'
          }, 
          {
            test: /\.png/,
            type: 'asset/resource'
          },
          {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader,'css-loader'],
          },
        ]
    },
   
};