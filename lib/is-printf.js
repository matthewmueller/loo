'use strict'

/**
 * Regexp
 */

let printf = /%[sdj%]/

/**
 * Export `is_printf`
 */

module.exports = is_printf

/**
 * Test if a string is printf
 */

function is_printf (str) {
  return printf.test(str)
}
