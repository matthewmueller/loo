'use strict'

/**
 * Regexp
 */

let rprintf = /%[sdj]/g

/**
 * Export `is_printf`
 */

module.exports = printf

/**
 * Test if a string is printf
 */

function printf (str) {
  return str.match(rprintf)
}
