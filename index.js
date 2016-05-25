'use strict'

/**
 * Module Dependencies
 */

let levels = 'trace debug info warn error fatal'.split(' ')
var Writable = require('readable-stream/writable')
let stringify = require('json-stringify-safe')
let Emitter = require('events').EventEmitter
let write_stream = require('stream-write')
let arrange = require('./lib/arrange')
let assign = require('object-assign')
let tumble = require('tumbleweed')
let Tree = require('./lib/tree')
let sliced = require('sliced')

/**
 * Create a global bus to pass
 * messages across node modules
 * (within the same process)
 */

let bus = global['loo'] = (global['loo'] || new Emitter)

/**
 * We don't want complaints about listeners
 */

bus.setMaxListeners(0)

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

  // listen for loo logs
  if (namespace === 'root') {
    bus.on('log', write)
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
      let parents = tree.up(namespace)
      let args = sliced(arguments)

      let fields = parents.reduce(function (fields, parent) {
        let all = parent.fields['$all'] || {}
        let lvl = parent.fields[level] || {}
        return assign({}, fields, all, lvl)
      }, {})

      args = Object.keys(fields).length
        ? [fields].concat(args)
        : args

      // update the json fields
      let json = assign(tumble(args), {
        level: level,
        name: namespace
      })

      // send to the other listeners
      bus.emit('log', json)
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
        ? arrange(json)
        : stringify(arrange(json)) + '\n'
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
