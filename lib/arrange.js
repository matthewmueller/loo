'use strict'

/**
 * Module Dependencies
 */

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
 * Export `arrange`
 */

module.exports = arrange

/**
 * Append and arrange the entries in the message
 *
 * @param {Object} json
 * @return {Object}
 */

function arrange (json) {
  let out = {}

  // time goes first
  out.time = (new Date()).toISOString()

  // add the keys
  if (json.level !== undefined) out.level = json.level
  if (json.name !== undefined) out.name = json.name.replace(rroot, '')
  if (json.message !== undefined) out.message = json.message
  if (json.err !== undefined) out.err = json.err
  if (json.fields !== undefined) out.fields = json.fields

  // check that json.fields.message !== json.message
  if (json.fields && json.fields.message === json.message) {
    delete out.fields.message
  }

  // add the additional top-level fields
  out.host = hostname
  out.pid = process.pid

  return out
}
