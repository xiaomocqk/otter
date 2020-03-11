// const path = require('path');
// const fs = require('fs');
// const { exec } = require('child_process');
// const program = require('commander');
// const chalk = require('chalk');
// const ora = require('ora');
const express = require('express');
const webpack = require('webpack');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const historyFallback = require('connect-history-api-fallback');
// const cors = require('cors');
const webpackConfig = require('../webpack.config');
const { getHost, getPort } = require('./utils/getAddress');
const openBrowser = require('./utils/openBrowser');
const webpackMiddleware = require('./middlewares/webpackMiddleware');
const proxyMiddleware = require('./middlewares/proxyMiddleware');
const { DEFAULT_PORT } = require('./utils/constance');

start();

async function start() {
  const HOST = getHost();
  const PORT = await getPort(HOST, DEFAULT_PORT);
  const address = `http://${HOST}:${PORT}`;
  const server = express();
  const compiler = webpack(webpackConfig);

  // webpack 相关中间件
  server.use(webpackMiddleware(compiler));
  // 设置代理
  proxyMiddleware(server);
  // 使用 browserRouter 时，需要重定向所有 html 页面到首页
  server.use(historyFallback());
  // 自动打开浏览器
  openBrowser(compiler, address);
  // 开发 chrome 扩展的时候可能需要开启跨域，参考：https://juejin.im/post/5e2027096fb9a02fe971f6b8
  // server.use(cors());

  const httpServer = server.listen(PORT, HOST, err => {
    if (err) return console.error(err);

    console.log(
      logSymbols.success,
      `Server is running at ${chalk.magenta.underline(address)}`
    );

    console.log(
      logSymbols.info,
      chalk.green('请等待, 编译完成后将自动打开浏览器')
    );

    // 我们监听了 node 信号，所以使用 cross-env-shell 而不是 cross-env
    // 参考：https://github.com/kentcdodds/cross-env#cross-env-vs-cross-env-shell
    process.on('SIGINT', () => {
      httpServer.close();
      // 在 ctrl + c 的时候随机输出 'See you again' 和 'Goodbye'
      console.log(
        chalk.blueBright.bold(`\nGoodbye~`),
      );

      process.exit(0);
  });
});

}
