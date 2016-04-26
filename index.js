'use strict'

/**
 * Module Dependencies
 */

let levels = 'trace debug info warn error fatal'.split(' ')
var Writable = require('readable-stream/writable')
let variables  = require('./lib/printf-variables')
let stringify = require('json-stringify-safe')
let write_stream = require('stream-write')
let assign = require('object-assign')
let format = require('./lib/format')
let printf = require('util').format
let Tree = require('./lib/tree')
let sliced = require('sliced')

/**
 * Export a `Logger` singleton
 */

module.exports = Logger('root')

/**
 * Create a `Logger`
 *
 * @param {String} namespace
 * @param {Object} transports
 * @param {Object} fields
 * @return {logger} function
 * @private true
 */

function Logger (namespace, tree) {
  tree = tree || Tree()

  // add entry in the tree
  if (!tree(namespace)) {
    tree(namespace, { transports: {}, fields: {} })
  }

  // listen for sutra logs
  if (namespace === 'root') {
    process.on('sutra', write)
  }

  // create a logger
  function logger (ns) {
    let name = namespace.split(':')
    ns = name.concat(ns).join(':')
    return Logger(ns, tree)
  }

  // go to all levels
  logger.fields = Fields()
  logger.reset = Reset()
  logger.pipe = Pipe()
  logger.tree = tree

  // setup the levels
  levels.map(function (level) {
    logger[level] = Log(level)
  })

  return logger

  // create the logger for the given `level`
  function Log (level) {
    function log (message) {
      let json = prepare(level, namespace, sliced(arguments))
      let parents = tree.up(namespace)

      let fields = parents.reduce(function (fields, parent) {
        let all = parent.fields['$all'] || {}
        let lvl = parent.fields[level] || {}
        return assign({}, fields, all, lvl)
      }, {})

      // update the json fields
      json = assign(json, fields)

      // send to the other listeners
      process && process.emit
        ? process.emit('sutra', json)
        : write(json)
    }

    log.fields = Fields(level)
    log.pipe = Pipe(level)

    return log
  }

  function write (json, parents) {
    parents = parents || tree.up(json.name)
    let streams = parents.reduce(function (streams, parent) {
      let all = parent.transports['$all'] || []
      let lvl = parent.transports[json.level] || []
      return streams.concat(lvl).concat(all)
    }, [])

    for (let i = 0, stream; stream = streams[i]; i++) {
      let log = is_object_mode(stream)
        ? format(json)
        : stringify(format(json)) + '\n'
      write_stream(stream, log, next)
    }

    // TODO what should we do if the stream has an error?
    function next (err) {
      if (err) console.error(err)
    }
  }

  // create a .pipe() for the `level`
  function Pipe (level) {
    level = level || '$all'
    return function pipe (stream) {
      let transports = tree(namespace).transports
      if (!transports[level]) transports[level] = []
      transports[level].push(stream)
      // TODO: ensure that it's a transform stream
      // and not a writeable stream, where this
      // probably wouldn't work
      stream.pipe(sink())
      return logger
    }
  }

  // create a .fields() for the `level`
  function Fields (level) {
    level = level || '$all'
    return function field (obj) {
      obj = obj || {}
      let fields = tree(namespace).fields
      if (!fields[level]) fields[level] = {}
      fields[level] = assign(fields[level], obj)
      return logger
    }
  }

  // reset the transports and fields
  function Reset () {
    return function reset () {
      tree.reset()
      tree('root', { transports: {}, fields: {} })
    }
  }
}

/**
 * Prepare the log
 *
 * TODO: should there be custom serialization support?
 *
 * @param {String} level
 * @param {String} name
 * @param {Array} args
 */

function prepare (level, name, args) {
  let out = {
    level: level,
    name: name
  }

  if (typeof args[0] === 'string') {
    let vars = variables(args[0])
    if (vars !== null) {
      if (args.length < vars.length + 1) {
        throw new Error(`log("${name}").${level}(...): Invalid number of parameters. Expected ${vars.length + 1}, got ${args.length}.`)
      }
      out.message = printf.apply(null, args.slice(0, vars.length + 1))
      args = args.slice(vars.length + 1)
    } else {
      out.message = args.shift()
    }
  } else if (is_error(args[0])) {
    let error = args.shift()

    // attach to the message
    if (!out.message) {
      out.message = error.code
        ? error.code + ': ' + error.message
        : error.message
    }

    // attach the rest of the error
    out = assign(out, {
      err: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    })
  }

  return args.reduce(function (out, fields) {
    return assign(out, fields)
  }, out)
}

/**
 * Check if the value is an Error
 *
 * @param {Mixed} mixed
 * @return {Boolean}
 */

function is_error(mixed) {
  return Object.prototype.toString.call(mixed) === '[object Error]'
    || mixed instanceof Error
}

/**
 * Check if the stream is in object-mode
 *
 * @param {Stream} stream
 * @return {Boolean}
 */

function is_object_mode (stream) {
  return stream._writableState
    && stream._writableState.objectMode === true
}

/**
 * Create a sink
 */

function sink () {
  return new Writable({
    objectMode: true,
    write: function (file, enc, fn) {
      fn()
    }
  })
}
