//配置文件
require('./check-versions')()

var config = require('../config')
// 如果 Node 的环境无法判断当前是 dev / product 环境
// 使用 config.dev.env.NODE_ENV 作为当前的环境
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}
// 可以强制打开浏览器并跳转到指定 url 的插件
// https://github.com/sindresorhus/opn
var opn = require('opn')
// node自带的文件路径工具
var path = require('path')
// express框架
var express = require('express')
var webpack = require('webpack')
// 测试环境，使用的配置与生产环境的配置一样
// 非测试环境，即为开发环境，因为此文件只有测试环境和开发环境使用
var proxyMiddleware = require('http-proxy-middleware')
//开发环境配置文件
//生产环境配置文件->require('./webpack.prod.conf')
var webpackConfig = require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
// 端口号为命令行输入的PORT参数或者配置文件中的默认值
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
// 配置文件中 是否自动打开浏览器
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// 配置文件中 http代理配置
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable
// 启动 express 服务
var app = express()
// 启动 express 服务
var compiler = webpack(webpackConfig)
// 可以将编译后的文件暂存到内存中的插件
// https://github.com/webpack/webpack-dev-middleware
var devMiddleware = require('webpack-dev-middleware')(compiler, {
    // 公共路径，与webpack的publicPath一样
  publicPath: webpackConfig.output.publicPath,
    // 不打印
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

// var uri = 'http://localhost:' + port
var uri = 'http://127.0.0.1:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
