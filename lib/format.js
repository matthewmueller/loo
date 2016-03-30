'use strict'

/**
 * Module Dependencies
 */

let stringify = require('json-stringify-safe')
let assign = require('object-assign')
let os = require('os')

/**
 * Constants
 */

let hostname = os.hostname()
let pid = process.pid

/**
 * Export `format`
 */

module.exports = format

/**
 * Format your message
 */

function format (json) {
  let out = {}
  out.time = (new Date()).toISOString()
  out = assign(out, json)
  out.host = hostname
  out.pid = process.pid
  return stringify(out) + '\n'
}
