const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

const compiler = webpack(webpackConfig);

compiler.run((error, stats) => {
  if (error) {
      console.error(error);
      return;
  }

  const prodStatsOpts = {
      preset: 'normal',
      modules: true,
      colors: true,
  };

  console.log(stats.toString(prodStatsOpts));
});