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
    t.deepEqual(list, [ 'index.js#4f363780536f4c822bb05a36deec2b4137b30afd' ])
    t.end()
  })
})

test('fetching with an github client should work', function (t) {
  ls(REPO + '/tree/test', github, function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, [
      '.gitignore#c9106a73f2a7ffa966b6968fe8d2aae6b444b210',
      '.travis.yml#c3dc66efd0e0289c30ccaca83948e9ffda4ad1bf',
      'index.js#1221074b4cf00a7d10a48bae3d680f02e70d04d5',
      'npm-debug.log#0ad56cf44c8bdb3ce25a6eeb2b66f9768f99ebdb',
      'package.json#d69198c26e647ab118afbf4f7800d685c68e226c',
      'index.js#4f363780536f4c822bb05a36deec2b4137b30afd'
    ])
    t.end()
  })
})
