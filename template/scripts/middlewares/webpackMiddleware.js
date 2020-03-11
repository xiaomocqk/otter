const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../../webpack.config.js');

module.exports = function webpackMiddleware(compiler) {
    const devMiddlewareOptions = {
        publicPath: webpackConfig.output.publicPath,
        // 只在发生错误或有新的编译时输出
        stats: 'minimal',
        // 需要输出文件到磁盘可以开启
        writeToDisk: true
    };

    const hotMiddlewareOptions = {
        // sse 路由
        path: '/__webpack_hmr',
        // 编译出错会在网页中显示出错信息遮罩
        overlay: true,
        // webpack 卡住自动刷新页面
        reload: true,
    };

    return [
        webpackDevMiddleware(compiler, devMiddlewareOptions),
        webpackHotMiddleware(compiler, hotMiddlewareOptions),
    ];
}