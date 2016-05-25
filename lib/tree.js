'use strict'

/**
 * Module Dependencies
 */

let split = require('split-string')

/**
 * Export `Tree`
 */

module.exports = Tree

/**
 * Create a tree of references
 *
 * @return {Function}
 */

function Tree () {
  let data = {}

  function tree (key, value) {
    return arguments.length === 2
      ? set(key, value)
      : get(key)
  }

  function set (key, value) {
    data[key] = value
  }

  function get (key) {
    return data[key]
  }

  tree.up = function up (key) {
    let parts = split(key, ':')
    let parent = key
    let keys = []

    while (parts.length) {
      data[parent] && keys.push(data[parent])
      parts.pop()
      parent = parts.join(':')
    }

    return keys
  }

  tree.reset = function () {
    for (var k in data) delete data[k]
  }

  tree.data = data

  return tree
}
