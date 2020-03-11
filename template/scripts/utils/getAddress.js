const OS = require('os');
const _getPort = require('get-port');

function getHost() {
  const interfaces = OS.networkInterfaces();

  for (let key in interfaces) {
    let iface = interfaces[key];

    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];

      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
}

async function getPort(host, port) {
  const result = await _getPort({ host, port });

  // 没被占用就返回这个端口号
  if (result === port) {
      return result;
  }

  // 递归，端口号 +1
  return getPort(host, port + 1);
}

module.exports = {
  getHost,
  getPort
};