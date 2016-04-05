'use strict'
var test = require('tap').test
var ls = require('..')
var REPO = 'martinheidegger/github-ls'
var Github = require('github4')
var github = new Github({
  version: '3.0.0',
  headers: {
    'user-agent': 'open-github-teams'
  }
})
github.authenticate({
  type: 'oauth',
  token: require('../test_auth').token
})

test('fetching with a null github client should work', function (t) {
  ls(REPO + '/tree/test/test', null, function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, [ 'index.js' ])
    t.end()
  })
})

test('fetching with an github client should work', function (t) {
  ls(REPO + '/tree/test/test', github, function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, [ 'index.js' ])
    t.end()
  })
})
