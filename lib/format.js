'use strict'

/**
 * Module Dependencies
 */

let stringify = require('json-stringify-safe')
let assign = require('object-assign')
let keys = Object.keys
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
  let fields = assign({}, json)
  let out = {}

  // time goes first
  out.time = (new Date()).toISOString()

  // add the keys
  if (fields.level) out.level = fields.level; delete fields.level
  if (fields.name) out.name = fields.name.replace(rroot, ''); delete fields.name
  if (fields.message) out.message = fields.message; delete fields.message
  if (fields.err) out.err = fields.err; delete fields.err

  // add the rest of the custom fields
  if (keys(fields).length) {
    out = assign(out, { fields: fields })
  }

  // add the additional top-level fields
  out.host = hostname
  out.pid = process.pid

  return stringify(out) + '\n'
}
