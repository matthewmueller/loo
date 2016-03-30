'use strict'

/**
 * Module Dependencies
 */

let stringify = require('json-stringify-safe')
let assign = require('object-assign')
let os = require('os')

/**
 * Remove root
 */

let rroot = /^root\:/

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

  if (out.name) {
    out.name = out.name.replace(rroot, '')
  }

  return stringify(out) + '\n'
}
