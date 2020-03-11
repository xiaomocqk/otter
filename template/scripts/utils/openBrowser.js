const open = require('open');
const { Compiler } = require('webpack');

module.exports = function openBrowser(compiler, address) {
  let hadOpened = false;

  compiler.hooks.done.tap('open-browser-plugin', async (stats) => {
    if (!hadOpened && !stats.hasErrors()) {
      await open(address);
      hadOpened = true;
    }
  });
}
