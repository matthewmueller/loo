/**
 * Module Dependencies
 */

var Passthrough = require('stream').PassThrough
var os = require('os')

/**
 * Constants
 */

var hostname = os.hostname()
var pid = process.pid

/**
 * Default levels
 */

var levels = ['info', 'warn', 'error', 'fatal']

/**
 * Export `Rise`
 */

function Rise (name, options) {
  options = options || {}

  var transports = options.transports = append(options.transports || {})
  var formatter = options.format = options.format || format

  function rise (sub) {
    return new Rise(name + ':' + sub, options)
  }

  rise.trace = create('trace')
  rise.debug = create('debug')
  rise.info = create('info')
  rise.warn = create('warn')
  rise.error = create('error')
  rise.fatal = create('fatal')
  rise.all = all

  rise.format = function (fmt) {
    formatter = fmt
    return rise
  }

  function create (level) {
    return function log (message) {
      if (!arguments.length) return transport(level)

      var streams = transports[level].length
        ? transports[level]
        : []

      for (var i = 0; stream = streams[i]; i++) {
        stream.write(formatter(level, name, message))
      }
    }
  }

  function append (obj) {
    var out = {}
    for (var i = 0, level; level = levels[i]; i++) {
      out[level] = obj[level] ? [].concat(obj[level]) : []
    }
    return out
  }

  function transport (level) {
    var stream = new Passthrough()
    transports[level].push(stream)
    return stream
  }

  function all () {
    var stream = new Passthrough()
    for (var level in transports) {
      transports[level].push(stream)
    }
    return stream
  }

  return rise
}

function format (level, name, message) {
  return JSON.stringify({
    ts: (new Date()).toISOString(),
    level: level,
    name: name,
    msg: message,
    host: hostname,
    pid: pid
  }) + '\n'
}

var rise = Rise('app')
rise.all().pipe(process.stdout)
rise.info().pipe(process.stdout)
rise.info().pipe(process.stdout)
rise.error().pipe(process.stdout)

var r = rise('zomg')
r.info({ rofl: 'coptor' })
rise.info('oh no!')
rise.fatal('fatal!!')

