'use strict'

let split = require('split-string')

module.exports = Tree

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
    if (!data[key]) return []
    let parts = split(key, ':')
    let parent = key
    let keys = [data[parent]]
    while (parts.length) {
      parts.pop()
      parent = parts.join(':')
      data[parent] && keys.push(data[parent])
    }

    return keys
  }

  tree.reset = function () {
    for (var k in data) delete data[k]
  }

  tree.data = data

  return tree
}

// var tree = Tree()
// var a = [1]
// var b = [2]
// var b1 = [3]
// var c = [4]

// tree('a', a)
// tree('a.b', b)
// tree('a.b.1', b1)
// tree('a.c', c)

// console.log('a', tree('a'))
// console.log('a.b', tree('a.b'))
// console.log('a.b.1', tree('a.b.1'))
// console.log('a.c', tree('a.c'))

// a.push(5)

// console.log(tree.up('a.b.1'))

