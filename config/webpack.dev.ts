import { commonConfig, electronMainConfig, electronRendererConfig } from './webpack.common';
import merge from 'webpack-merge';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const devConfig: webpack.Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  plugins: [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })],
};

const mainConfig = merge(commonConfig, merge(electronMainConfig, devConfig));
const renderConfig = merge(commonConfig, merge(electronRendererConfig, devConfig));
const config = [mainConfig, renderConfig];

export default config;
