'use strict'

/**
 * Module Dependencies
 */

let levels = 'trace debug info warn error fatal'.split(' ')
let is_printf = require('./lib/is-printf')
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

      let streams = parents.reduce(function (streams, parent) {
        let all = parent.transports['$all'] || []
        let lvl = parent.transports[level] || []
        return streams.concat(lvl).concat(all)
      }, [])

      for (let i = 0, stream; stream = streams[i]; i++) {
        stream.write(format(json))
      }
    }

    log.fields = Fields(level)
    log.pipe = Pipe(level)

    return log
  }

  // create a .pipe() for the `level`
  function Pipe (level) {
    level = level || '$all'
    return function pipe (stream) {
      let transports = tree(namespace).transports
      if (!transports[level]) transports[level] = []
      transports[level].push(stream)
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
    if (is_printf(args[0])) {
      out.message = printf.apply(null, args)
      return out
    } else {
      out.message = args.shift()
    }
  } else if (is_error(args[0])) {
    let error = args.shift()
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
 * Shallow copy specific to sutra's object shape
 *
 * @param {Object|Array} obj
 * @return {Object|Array}
 */

function copy (obj) {
  let out = {}
  for (let k in obj) {
    out[k] = Array.isArray(obj[k])
      ? [].concat(obj[k])
      : assign({}, obj[k])
  }
  return out
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
