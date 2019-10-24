import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
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
    extensions: ['.tsx', '.ts'],
  },
};

const electronMainConfig: webpack.Configuration = {
  name: 'electronMainConfig',
  entry: './src/main/main.ts',
  target: 'electron-main',
  output: {
    filename: 'app/main.js',
  },
  plugins: [new CleanWebpackPlugin()],
};

const electronRendererConfig: webpack.Configuration = {
  name: 'electronRendererConfig',
  entry: {
    renderer: './src/app/ts/app.ts',
    preload: './src/preload/preload.ts',
  },
  target: 'electron-renderer',
  output: {
    filename: 'app/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'src/app/index.html', to: 'app' }]),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/app.css',
    }),
  ],
};
export { commonConfig, electronMainConfig, electronRendererConfig };
