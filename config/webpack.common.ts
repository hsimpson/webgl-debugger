import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
//import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import path from 'path';
import webpack from 'webpack';

const buildFolder = __dirname;
const rootFolder = path.resolve(buildFolder, '../');

const commonConfig: webpack.Configuration = {
  output: {
    path: path.resolve(rootFolder, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'], // order is important here!!!
  },
};

const electronMainConfig: webpack.Configuration = {
  name: 'electronMainConfig',
  entry: './src/mainprocess/mainprocess.ts',
  target: 'electron-main',
  output: {
    filename: 'app/main.js',
  },
  plugins: [new CleanWebpackPlugin()],
};

const electronRendererConfig: webpack.Configuration = {
  name: 'electronRendererConfig',
  entry: {
    renderer: './src/app/index.tsx',
    preloadapp: './src/preload/preloadapp.ts',
    preloadwebglwindow: './src/preload/preloadwebglwindow.ts',
  },
  target: 'electron-renderer',
  output: {
    filename: 'app/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
              publicPath: (url) => '../fonts/' + url,
            },
          },
        ],
      },
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/',
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/app/index.html', to: '.' },
      { from: 'glslangValidator', to: 'glslangValidator' },
    ]),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/app.css',
    }),
    //new MonacoWebpackPlugin({ languages: ['javascript', 'cpp'] }),
  ],
};
export { commonConfig, electronMainConfig, electronRendererConfig };
