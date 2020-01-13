import { commonConfig, electronMainConfig, electronRendererConfig } from './webpack.common';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import merge from 'webpack-merge';
import webpack from 'webpack';

const prodConfig: webpack.Configuration = {
  mode: 'production',

  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
};

const mainConfig = merge(commonConfig, merge(electronMainConfig, prodConfig));
const renderConfig = merge(commonConfig, merge(electronRendererConfig, prodConfig));
const config = [mainConfig, renderConfig];

export default config;
